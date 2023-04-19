import { Server } from "socket.io";
import {
  terminateRoom,
  leaveRoom,
  startRoom,
  getCurrentQuizzFromMongo,
  getCurrentQuizzFromRedis,
} from "./server/models/game.js";
import { gameHostValidation } from "./server/models/user.js";
import { showRank } from "./server/models/score.js";

export const socketio = async function (server) {
  const io = new Server(server);
  io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("join", async (object) => {
      const { userId, userName, roomId } = object;
      const validationUser = await gameHostValidation(userId, userName, roomId);
      socket.join(roomId);
      socket.roomId = roomId;
      if (validationUser) {
        socket.emit("showControllerInterface", { userName, userId, roomId });
        socket.hostId = userId;
        // 檢查io是否有host,score,data(是否現在線上都不存在房間)
        if (!io.host) io.host = {};
        io.host[roomId] = { userId, userName, roomId };
        if (!io.score) io.score = {};
        io.score[roomId] = [];
        if (!io.data) io.data = {};
        io.data[roomId] = [];
        if (!io.quizNum) io.quizNum = {};
        io.quizNum[roomId] = 1;
        socket.emit("welcomeMessage");
      } else {
        socket.emit("message", `Welcome to the game room, ${userName} !`);
        socket.userId = userId;
        const user = { userId, userName };
        if (!io.users) {
          io.users = {};
        }
        if (!io.users[roomId]) io.users[roomId] = [];
        io.users[roomId].push(user);
        io.to(roomId).emit("userJoined", [io.host[roomId], io.users[roomId]]);
      }
    });
    socket.on("disconnect", async () => {
      console.log("A user disconnected");
      const roomId = socket.roomId;
      if (socket.hostId) {
        delete io.host[roomId];
        await leaveRoom(roomId, socket.hostId, true);
        // FIXME: 下面這段(正式環境下)感覺不會發生?
        if (!io.users || !io.users[roomId]) return;
        if (!io.users[roomId][0] && !io.host[roomId]) {
          await terminateRoom(roomId);
          delete io.users[roomId];
          delete io.score[roomId];
          delete io.data[roomId];
        }
        // FIXME: 這邊應該要emit一個訊息，broadcast到所有player，請他們回到首頁。
      }
      if (io.users && io.users[roomId]) {
        io.users[roomId] = io.users[roomId].filter(
          (user) => user.userId !== socket.userId
        );
        await leaveRoom(roomId, socket.userId);
        io.to(roomId).emit("userLeft", io.users[roomId]);
      }
      // FIXME: 下面這段(正式環境下)感覺不會發生?
      if (!io.users || !io.users[roomId]) return;
      if (!io.users[roomId][0] && !io.host[roomId]) {
        await terminateRoom(roomId);
        delete io.users[roomId];
        delete io.score[roomId];
        delete io.data[roomId];
      }
    });
    socket.on("startGame", async () => {
      const { roomId, hostId } = socket;
      const { firstQuizz, length } = await startRoom(roomId, hostId);
      if (!firstQuizz || !length) return;
      firstQuizz.num = 1;
      const rankResult = await showRank(roomId, Infinity);
      io.to(roomId).emit("loadFirstQuizz", { firstQuizz, length, rankResult });
    });

    socket.on("nextQuiz", async (quizNum) => {
      const { roomId } = socket;
      io.quizNum[roomId] += 1;
      const quiz = await getCurrentQuizzFromRedis(roomId, quizNum);
      if (quiz) {
        io.to(roomId).emit("showQuiz", quiz);
      } else {
        const quiz = await getCurrentQuizzFromMongo(roomId, quizNum);
        io.to(roomId).emit("showQuiz", quiz);
      }
    });

    socket.on("getAnswer", ({ chooseOption, initvalue, score }) => {
      const { roomId, userId } = socket;
      const index = io.quizNum[roomId] - 1;
      if (!io.score[roomId][index]) io.score[roomId][index] = {};
      if (!io.data[roomId][index]) io.data[roomId][index] = {};
      // 最後用來留紀錄給mongo db 的，用來存歷史資料
      console.log("chooseoption", chooseOption);
      io.score[roomId][index][userId] = chooseOption;
      chooseOption.forEach((option) => {
        if (!io.data[roomId][index][option]) {
          io.data[roomId][index][option] = 1;
        } else {
          io.data[roomId][index][option] += 1;
        }
      });
      io.to(roomId).emit("updateRankAndScore", { initvalue, score, userId });
    });
    // 只有host會接到timeout
    socket.on("timeout", async (lastquiz) => {
      const { roomId } = socket;
      const index = io.quizNum[roomId] - 1;
      const scoreObj = io.data[roomId][index];
      io.to(roomId).emit("showQuizExplain", scoreObj);
      if (lastquiz) {
        socket.emit("showTotalScoreButton");
      }
    });
    socket.on("showFinal", async () => {
      const { roomId } = socket;
      const rankResult = await showRank(roomId, 5);
      io.to(roomId).emit("showFinalScore", rankResult);
    });
  });
};
