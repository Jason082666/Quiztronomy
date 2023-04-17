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
        io.host = {};
        io.host[roomId] = { userId, userName, roomId };
        io.score = {};
        io.score[roomId] = {};
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
        if (!io.users || !io.users[roomId]) return;
        if (!io.users[roomId][0] && !io.host[roomId]) {
          // terminate the room!(也不用存資料)
          await terminateRoom(roomId);
          delete io.users[roomId];
        }
        delete io.score[roomId];
        return;
      }
      if (io.users && io.users[roomId]) {
        io.users[roomId] = io.users[roomId].filter(
          (user) => user.userId !== socket.userId
        );
        await leaveRoom(roomId, socket.userId);
        io.to(roomId).emit("userLeft", io.users[roomId]);
      }
      if (!io.users || !io.users[roomId]) return;
      if (!io.users[roomId][0] && !io.host[roomId]) {
        await terminateRoom(roomId);
        delete io.users[roomId];
        delete io.score[roomId];
      }
    });
    socket.on("startGame", async () => {
      const { roomId, hostId } = socket;
      const { firstQuizz, length } = await startRoom(roomId, hostId);
      if (!firstQuizz) return;
      firstQuizz.num = 1;
      const rankResult = await showRank(roomId, Infinity);
      io.to(roomId).emit("loadFirstQuizz", { firstQuizz, length, rankResult });
    });

    socket.on("nextQuiz", async (quizNum) => {
      const { roomId } = socket;
      delete io.score[roomId];
      io.score[roomId] = {};
      const quiz = await getCurrentQuizzFromRedis(roomId, quizNum);
      if (quiz) {
        io.to(roomId).emit("showQuiz", quiz);
      } else {
        const quiz = await getCurrentQuizzFromMongo(roomId, quizNum);
        io.to(roomId).emit("showQuiz", quiz);
      }
    });

    socket.on("getAnswer", ({ chooseOption, initvalue, score }) => {
      console.log(chooseOption);
      const { roomId, userId } = socket;
      if (!(chooseOption in io.score[roomId])) {
        io.score[roomId][chooseOption] = 1;
      } else {
        io.score[roomId][chooseOption] += 1;
      }
      io.to(roomId).emit("updateRankAndScore", { initvalue, score, userId });
    });
    socket.on("timeout", async () => {
      const { roomId } = socket;
      const scoreObj = io.score[roomId];
      console.log(scoreObj);
      const rankResult = await showRank(roomId, 3);
      io.to(roomId).emit("showScoreTable", { scoreObj, rankResult });
    });
  });
};
