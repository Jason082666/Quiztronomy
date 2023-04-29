import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import {
  terminateRoom,
  leaveRoom,
  startRoom,
  getCurrentQuizzFromMongo,
  getCurrentQuizzFromRedis,
  playerDisconnect,
} from "./server/models/game.js";
import { redisClient } from "./server/models/redis.js";
import { gameHostValidation } from "./server/models/user.js";
import { showRank, addToQuequeAndUpdateMongo } from "./server/models/score.js";
import {
  addGameHistory,
  addGameHistoryToHost,
} from "./server/models/historydata.js";
import { deleteKey } from "./server/models/redis.js";

export const socketio = async function (server) {
  const io = new Server(server);
  const pubClient = redisClient;
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));
  io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("join", async (object) => {
      const { userId, userName, roomId, gameName } = object;
      const validationUser = await gameHostValidation(userId, userName, roomId);
      socket.join(roomId);
      socket.roomId = roomId;
      if (validationUser) {
        socket.emit("showControllerInterface", { userName, userId, roomId });
        socket.hostId = userId;
        if (!io.host) io.host = {};
        io.host[roomId] = { userId, userName, roomId };
        if (!io.gameName) io.gameName = {};
        io.gameName[roomId] = gameName;
        if (!io.users) io.users = {};
        io.users[roomId] = [];
        if (!io.score) io.score = {};
        io.score[roomId] = [];
        if (!io.data) io.data = {};
        io.data[roomId] = [];
        if (!io.quizNum) io.quizNum = {};
        io.quizNum[roomId] = 1;
        if (!io.quizLength) io.quizLength = {};
        io.quizLength[roomId] = "";
        socket.emit("welcomeMessage");
      } else {
        const welcomeString = `Welcome to the game room, ${userName} !`;
        socket.emit("message", {
          welcomeString,
          gameName: io.gameName[roomId],
        });
        socket.userId = userId;
        socket.userName = userName;
        const user = { userId, userName };
        io.users[roomId].push(user);
        io.to(roomId).emit("userJoined", [io.host[roomId], io.users[roomId]]);
      }
    });
    socket.on("disconnect", async () => {
      console.log("A user disconnected");
      const roomId = socket.roomId;
      if (socket.hostId) {
        await deleteKey(`${roomId}-room`);
        await deleteKey(`${roomId} -score`);
        await deleteKey(`${roomId}`);
        await deleteKey(`${roomId}-disconnect`);
        await terminateRoom(roomId);
        delete io.host[roomId];
        delete io.users[roomId];
        delete io.score[roomId];
        delete io.data[roomId];
        delete io.quizNum[roomId];
        delete io.gameName[roomId];
        delete io.quizLength[roomId];
        io.to(roomId).emit("hostLeave");
        return;
      }
      if (io.users && io.users[roomId]) {
        io.users[roomId] = io.users[roomId].filter(
          (user) => user.userId !== socket.userId
        );
        if (!io.users[roomId]) {
          io.users[roomId] = [];
        }
        await leaveRoom(roomId, socket.userId);
        await playerDisconnect(roomId, socket.userId, socket.userName);
        io.to(roomId).emit("userLeft", io.users[roomId]);
      }
    });
    socket.on("startGame", async () => {
      const { roomId, hostId } = socket;
      const { firstQuizz, length } = await startRoom(roomId, hostId);
      if (!firstQuizz || !length) return;
      io.quizLength[roomId] = length;
      firstQuizz.num = 1;
      const rankResult = await showRank(roomId, Infinity);
      io.to(roomId).emit("loadFirstQuizz", { firstQuizz, length, rankResult });
    });

    socket.on("nextQuiz", async (quizNum) => {
      const { roomId } = socket;
      io.quizNum[roomId] += 1;
      const rankResult = await showRank(roomId, Infinity);
      const quiz = await getCurrentQuizzFromRedis(roomId, quizNum);
      if (quiz) {
        io.to(roomId).emit("showQuiz", {
          quiz,
          quizNum,
          quizLength: io.quizLength[roomId],
          rankResult,
        });
      } else {
        const quiz = await getCurrentQuizzFromMongo(roomId, quizNum);
        io.to(roomId).emit("showQuiz", {
          quiz,
          quizNum,
          quizLength: io.quizLength[roomId],
          rankResult,
        });
      }
    });

    socket.on("getAnswer", ({ chooseOption, initvalue, score }) => {
      const { roomId, userId } = socket;
      const index = io.quizNum[roomId] - 1;
      if (!io.score[roomId][index]) io.score[roomId][index] = {};
      if (!io.data[roomId][index]) io.data[roomId][index] = {};
      // 最後用來留紀錄給mongo db 的，用來存歷史資料
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
    socket.on("timeout", async () => {
      const { roomId } = socket;
      const index = io.quizNum[roomId] - 1;
      const scoreObj = io.data[roomId][index];
      io.to(roomId).emit("showQuizExplain", scoreObj);
    });
    socket.on("earlyTimeout", async () => {
      const { roomId } = socket;
      const index = io.quizNum[roomId] - 1;
      const scoreObj = io.data[roomId][index];
      io.to(roomId).emit("clearCountdown");
      io.to(roomId).emit("showQuizExplain", scoreObj);
    });
    socket.on("showFinal", async () => {
      const { roomId } = socket;
      const rankResult = await showRank(roomId, 5);
      const gameRoom = await addGameHistory(roomId, io.score[roomId]);
      await redisClient.del(`${roomId}-room`);
      await addGameHistoryToHost(
        gameRoom.founder.id,
        gameRoom._id,
        gameRoom.name,
        gameRoom.date
      );
      await addToQuequeAndUpdateMongo(roomId);
      io.to(roomId).emit("showFinalScore", rankResult);
    });
  });
};
