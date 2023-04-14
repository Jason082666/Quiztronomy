const socket = io();
const userName = localStorage.getItem("userName");
const userId = localStorage.getItem("userId");
const roomId = localStorage.getItem("roomId");
// Join chatroom
socket.emit("join", { userName, userId, roomId });
socket.on("message", (message) => {
  $("h1").empty();
  $("h1").text(message);
});
socket.on("welcomeMessage", () => {
  $("h1").empty();
  $("h1").text("Waiting for more players.");
});

socket.on("showControllerInterface", (host) => {
  const $startButton = $('<button id="start-game-btn">Start the game</button>');
  $("#host").text(`Host: ${host.userName}  roomId: ${host.roomId}`);
  socket.host = true;
  $startButton.appendTo($(".host-container"));
});

socket.on("userJoined", ([host, users]) => {
  console.log(host);
  console.log(users);
  $("#host").text(`Host: ${host.userName}, roomId: ${host.roomId}`);
  console.log("Users in room:", users);
  $("#player-list").empty();
  if (!socket.host) {
    const $leaveRoomButton = $(
      '<button id="leave-btn">Leave the room</button>'
    );
    $(".host-container").find("#leave-btn").remove();
    $leaveRoomButton.appendTo($(".host-container"));
  }
  users.forEach((user) => {
    const { userName } = user;
    const $userDiv = $(`<div>${userName}</div>`);
    $("#player-list").append($userDiv);
  });
});

socket.on("userLeft", (users) => {
  console.log("Users in room:", users);
  $("#player-list").empty();
  users.forEach((user) => {
    const { userName } = user;
    const $userDiv = $(`<div>${userName}</div>`);
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

$(".host-container").on("click", "#leave-btn", async () => {
  window.location.href = "/";
});
