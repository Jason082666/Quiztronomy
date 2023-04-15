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

$(".host-container").on("click", "#start-game-btn", () => {
  socket.emit("startGame");
});

socket.on("loadFirstQuizz", () => {
  let intervalId;
  let count = 5;
  $(".count-down-wrapper").fadeIn();
  $(".overlay").fadeIn();
  $(".count-down-number").html(count);
  $(".overlay").fadeIn();
  intervalId = setInterval(function () {
    count--;
    $(".count-down-number").html(count);
    if (count === 0) {
      clearInterval(intervalId);
      $(".count-down-wrapper").fadeOut();
      $(".overlay").fadeOut();
    }
  }, 1000);
});

const $countdown = $(
  `<div class="overlay"></div><div class="count-down-wrapper">
  <div class="count-down-radar"><div class="count-down-number">5</div></div>
</div>`
);
$(".container").after($countdown);

$(".host-container").on("click", "#leave-btn", async () => {
  window.location.href = "/";
});
