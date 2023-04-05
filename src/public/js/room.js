const socket = io();
const username = localStorage.getItem("username");
const userId = localStorage.getItem("userId");
const roomId = localStorage.getItem("roomId");
const hostname = localStorage.getItem("hostname");
const hostId = localStorage.getItem("hostId");
// Join chatroom
socket.emit("join", { hostId, hostname, username, userId, roomId });
socket.on("message", (message) => {
  $("h2").empty();
  $("h2").text(message);
});

socket.on("showControllerInterface", (host) => {
  const $startButton = $('<button id="start-game-btn">Start the game</button>');
  $("#host").text(
    `Host: ${host.hostname}, id: ${host.hostId}, roomId: ${host.roomId}`
  );
  $startButton.appendTo($(".container"));
});

socket.on("userJoined", ([host, users]) => {
  $("#host").text(
    `Host: ${host.hostname}, id: ${host.hostId}, roomId: ${host.roomId}`
  );
  console.log("Users in room:", users);
  $("#player-list").empty();
  users.forEach((user) => {
    const { username, userId } = user;
    const $userDiv = $(`<div>${username} (ID: ${userId})</div>`);
    $("#player-list").append($userDiv);
  });
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

socket.on("userLeft", (users) => {
  console.log("Users in room:", users);
  $("#player-list").empty();
  users.forEach((user) => {
    const { username, userId } = user;
    const $userDiv = $(`<div>${username} (ID: ${userId})</div>`);
    $("#player-list").append($userDiv);
  });
});
