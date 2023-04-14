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
  socket.host = true;
  $startButton.appendTo($(".container"));
});

socket.on("userJoined", ([host, users]) => {
  $("#host").text(
    `Host: ${host.hostname}, id: ${host.hostId}, roomId: ${host.roomId}`
  );
  console.log("Users in room:", users);
  $("#player-list").empty();
  if (!socket.host) {
    const $leaveRoomButton = $(
      '<button id="leave-btn">Leave the room</button>'
    );
    $(".btn-container").empty();
    $(".btn-container").append($leaveRoomButton);
  }
  users.forEach((user) => {
    const { username, userId } = user;
    const $userDiv = $(`<div>${username} (ID: ${userId})</div>`);
    $("#player-list").append($userDiv);
  });
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

$(".container").on("click", "#start-game-btn", () => {
  socket.emit("startGame");
});

socket.on("loadFirstQuizz", () => {
  if (socket.host) {
    console.log(789);
  } else {
    console.log(676);
    let intervalId;
    let count = 5;
    $(".count-down").css("display", "block").html(count);
    intervalId = setInterval(function () {
      count--;
      $(".count-down").html(count);
      if (count === 0) {
        clearInterval(intervalId);
        $(".count-down").css("display", "none");
      }
    }, 1000);
  }
});

const $countdown = $("<div class='count-down'>").css({
  position: "fixed",
  top: "20px",
  right: "20px",
  backgroundColor: "#fff",
  padding: "10px",
  borderRadius: "5px",
  boxShadow: "0 0 5px rgba(0, 0, 0, 0.3)",
  display: "none",
});
$(".container").append($countdown);

$(".btn-container").on("click", "#leave-btn", async () => {
  const id = localStorage.getItem("userId");
  const roomId = localStorage.getItem("roomId");
  const object = { id, roomId };
  await axios.post("/api/1.0/game/leave", object);
  window.location.href = "/";
});
