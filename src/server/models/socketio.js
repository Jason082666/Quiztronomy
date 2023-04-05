import { Server } from "socket.io";

export const socketio = async function (server) {
  const io = new Server(server);
  io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("join", async (object) => {
      const { userId, username, roomId, hostId, hostname } = object;
      socket.join(roomId);

      if (!username && !userId) {
        socket.emit("showControllerInterface", { hostname, hostId, roomId });
        socket.roomId = roomId;
        socket.hostId = hostId;
        io.host = {};
        io.host[roomId] = { hostId, hostname, roomId };
      } else {
        socket.emit("message", `Welcome to the game room, ${username} !`);
        socket.roomId = roomId;
        socket.userId = userId;
        const user = { userId, username };
        if (!io.users) {
          io.users = {};
        }
        if (!io.users[roomId]) io.users[roomId] = [];
        io.users[roomId].push(user);
        console.log(io.users[roomId]);
        io.to(roomId).emit("userJoined", [io.host[roomId], io.users[roomId]]);
      }
    });
    socket.on("disconnect", () => {
      console.log("A user disconnected");
      const roomId = socket.roomId;
      if (socket.hostId) {
        delete io.host[roomId];
      }
      if (io.users && io.users[roomId]) {
        io.users[roomId] = io.users[roomId].filter(
          (user) => user.userId !== socket.userId
        );
        console.log(io.users[roomId]);
        io.to(roomId).emit("userLeft", io.users[roomId]);
      }
      if (!io.users[roomId] && !io.host[roomId][0]) {
        // terminate the room!(也不用存資料)
        delete io.users[roomId];
      }
    });
  });
};
