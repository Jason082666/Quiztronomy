import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import {
  terminateRoom,
  leaveRoom,
  startRoom,
  addPlayerIntoRedisSortedSet,
  getCurrentQuizzFromRedis,
  playerDisconnect,
  findHostAndUsers,
  writePlayerAnswerIntoRedisList,
  getPlayerAnswerFromRedisList,
  setupDisconnectHash,
  countQuizLength,
} from "./server/models/game.js";
import { redisClient } from "./util/cacheConnection.js";
import { gameHostValidation } from "./server/models/user.js";
import { showRank, addToQuequeAndUpdateMongo } from "./server/models/score.js";
import {
  addGameHistory,
  addGameHistoryToHost,
} from "./server/models/historydata.js";
import { deleteGroupKey } from "./service/cache.js";

export const socketio = async function (server) {
  const io = new Server(server);
  const pubClient = redisClient;
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));
  io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("join", async (object) => {
      const { userId, userName, roomId } = object;
      socket.join(roomId);
      socket.roomId = roomId;
      const validationUser = await gameHostValidation(userId, userName, roomId);
      pubClient.pubsub("channels", (err, channels) => {
        if (!channels.includes(roomId)) {
          subClient.subscribe(roomId);
        }
      });
      if (validationUser) {
        socket.emit("showControllerInterface", { userName, userId, roomId });
        socket.hostId = userId;
        socket.quizNum = 1;
        setupDisconnectHash(roomId);
        socket.emit("welcomeMessage");
      } else {
        const welcomeString = `Welcome to the game room, ${userName} !`;
        socket.emit("message", welcomeString);
        socket.userId = userId;
        socket.userName = userName;
        const hostAndUserArray = await findHostAndUsers(roomId);
        const hostData = JSON.parse(hostAndUserArray[0].userName);
        const hostKey = Object.keys(hostData)[0];
        const hostPackage = {
          userId: hostKey,
          userName: hostData[hostKey],
          roomId,
        };
        const userPackage = hostAndUserArray.slice(2);
        const message = JSON.stringify({
          event: "userJoined",
          data: [hostPackage, userPackage],
        });
        pubClient.publish(roomId, message);
      }
    });

    socket.on("disconnect", async (reason) => {
      console.log(`A user disconnected due to ${reason}`);
      const roomId = socket.roomId;
      if (socket.hostId) {
        await deleteGroupKey([
          `${roomId}-room`,
          `${roomId} -score`,
          roomId,
          `${roomId}-connected`,
          `${roomId}-disconnect`,
          `${roomId}-player-answer`,
        ]);
        terminateRoom(roomId);
        const message = JSON.stringify({
          event: "hostLeave",
        });
        return await pubClient.publish(roomId, message);
      }
      leaveRoom(roomId, socket.userId);
      playerDisconnect(roomId, socket.userId, socket.userName);
      const hostAndUserArray = await findHostAndUsers(roomId);
      socket.leave(roomId);
      const userPackage = hostAndUserArray.slice(2);
      const message = JSON.stringify({
        event: "userLeft",
        data: userPackage,
      });
      pubClient.publish(roomId, message);
    });

    socket.on("startGame", async () => {
      const { roomId, hostId } = socket;
      const gameRoomResult = await startRoom(roomId, hostId);
      await addPlayerIntoRedisSortedSet(gameRoomResult);
      const firstQuizz = await getCurrentQuizzFromRedis(roomId, 1);
      const length = await countQuizLength(roomId);
      if (!firstQuizz || !length) return;
      socket.length = length;
      firstQuizz.num = 1;
      const rankResult = await showRank(roomId, Infinity);
      const message = JSON.stringify({
        event: "loadFirstQuizz",
        data: { firstQuizz, length, rankResult },
      });
      pubClient.publish(roomId, message);
    });

    socket.on("nextQuiz", async (quizNum) => {
      const { roomId } = socket;
      socket.quizNum += 1;
      const rankResult = await showRank(roomId, Infinity);
      const quiz = await getCurrentQuizzFromRedis(roomId, quizNum);
      const message = JSON.stringify({
        event: "showQuiz",
        data: {
          quiz,
          quizNum,
          quizLength: socket.length,
          rankResult,
        },
      });
      pubClient.publish(roomId, message);
    });

    socket.on(
      "getAnswer",
      async ({ chooseOption, initvalue, score, quizNum }) => {
        const { roomId, userId } = socket;
        await writePlayerAnswerIntoRedisList(
          roomId,
          userId,
          quizNum - 2,
          chooseOption
        );
        const message = JSON.stringify({
          event: "updateRankAndScore",
          data: { initvalue, score, userId },
        });
        await pubClient.publish(roomId, message);
      }
    );

    socket.on("timeout", async () => {
      const { roomId } = socket;
      const index = socket.quizNum - 1;
      const playerAnswerAnalysis = await getPlayerAnswerFromRedisList(
        roomId,
        index,
        index
      );
      const newPlayerAnswerAnalysis = {};
      if (playerAnswerAnalysis[0]) {
        const parsedPlayerAnswerAnalysis = JSON.parse(playerAnswerAnalysis);
        Object.values(parsedPlayerAnswerAnalysis).forEach(
          (playerAnswerArray) => {
            playerAnswerArray.forEach((playerAnswer) => {
              if (!newPlayerAnswerAnalysis[playerAnswer]) {
                newPlayerAnswerAnalysis[playerAnswer] = 1;
              } else {
                newPlayerAnswerAnalysis[playerAnswer] += 1;
              }
            });
          }
        );
      }
      const message = JSON.stringify({
        event: "showQuizExplain",
        data: newPlayerAnswerAnalysis,
      });
      await pubClient.publish(roomId, message);
    });

    socket.on("earlyTimeout", async () => {
      const { roomId } = socket;
      const index = socket.quizNum - 1;
      const playerAnswerAnalysis = await getPlayerAnswerFromRedisList(
        roomId,
        index,
        index
      );
      const newPlayerAnswerAnalysis = {};
      if (playerAnswerAnalysis[0]) {
        const parsedPlayerAnswerAnalysis = JSON.parse(playerAnswerAnalysis);
        Object.values(parsedPlayerAnswerAnalysis).forEach(
          (playerAnswerArray) => {
            playerAnswerArray.forEach((playerAnswer) => {
              if (!newPlayerAnswerAnalysis[playerAnswer]) {
                newPlayerAnswerAnalysis[playerAnswer] = 1;
              } else {
                newPlayerAnswerAnalysis[playerAnswer] += 1;
              }
            });
          }
        );
      }
      const message = JSON.stringify({
        event: "clearCountdown",
      });
      const dataMessage = JSON.stringify({
        event: "showQuizExplain",
        data: newPlayerAnswerAnalysis,
      });
      pubClient.publish(roomId, message);
      pubClient.publish(roomId, dataMessage);
    });
    socket.on("showFinal", async () => {
      const { roomId } = socket;
      const rankResult = await showRank(roomId, 5);
      const playerAnswerArray = await getPlayerAnswerFromRedisList(
        roomId,
        0,
        -1
      );
      console.log("answerArray", playerAnswerArray);
      const gameRoom = await addGameHistory(roomId, playerAnswerArray);
      addGameHistoryToHost(
        gameRoom.founder.id,
        gameRoom._id,
        gameRoom.name,
        gameRoom.date
      );
      addToQuequeAndUpdateMongo(roomId);
      const message = JSON.stringify({
        event: "showFinalScore",
        data: rankResult,
      });
      pubClient.publish(roomId, message);
    });
    subClient.on("message", async (roomId, message) => {
      if (roomId !== socket.roomId) return;
      const dataObject = JSON.parse(message);
      if (dataObject.event === "userJoined") {
        const host = dataObject.data[0];
        const users = dataObject.data[1];
        socket.emit("userJoined", [host, users]);
      }
      if (dataObject.event === "hostLeave") {
        socket.emit("hostLeave");
      }
      if (dataObject.event === "userLeft") {
        socket.emit("userLeft", dataObject.data);
      }
      if (dataObject.event === "loadFirstQuizz") {
        socket.emit("loadFirstQuizz", dataObject.data);
      }
      if (dataObject.event === "showQuiz") {
        socket.emit("showQuiz", dataObject.data);
      }
      if (dataObject.event === "updateRankAndScore") {
        socket.emit("updateRankAndScore", dataObject.data);
      }

      if (dataObject.event === "showQuizExplain") {
        socket.emit("showQuizExplain", dataObject.data);
      }
      if (dataObject.event === "clearCountdown") {
        socket.emit("clearCountdown");
      }
      if (dataObject.event === "showFinalScore") {
        socket.emit("showFinalScore", dataObject.data);
      }
    });
  });
};
