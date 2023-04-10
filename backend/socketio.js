import { Server } from "socket.io";
import { terminateRoom } from "./server/models/game.js";
export const socketio = async function (server) {
  const io = new Server(server);
  io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("join", async (object) => {
      const { userId, username, roomId, hostId, hostname } = object;
      socket.join(roomId);
      socket.roomId = roomId;
      if (!username && !userId) {
        socket.emit("showControllerInterface", { hostname, hostId, roomId });
        socket.hostId = hostId;
        io.host = {};
        io.host[roomId] = { hostId, hostname, roomId };
      } else {
        socket.emit("message", `Welcome to the game room, ${username} !`);
        socket.userId = userId;
        const user = { userId, username };
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
      }
      if (io.users && io.users[roomId]) {
        io.users[roomId] = io.users[roomId].filter(
          (user) => user.userId !== socket.userId
        );
        await leaveRoom(roomId, socket.userId);
        io.to(roomId).emit("userLeft", io.users[roomId]);
      }
      if (!io.users[roomId][0] && !io.host[roomId]) {
        // terminate the room!(也不用存資料)
        await terminateRoom(roomId);
        delete io.users[roomId];
      }
    });
    socket.on("startGame", () => {
      const roomId = socket.roomId;
      io.to(roomId).emit("loadFirstQuizz");
    });
  });
};
