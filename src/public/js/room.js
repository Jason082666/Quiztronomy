const socket = io();
const userName = localStorage.getItem("userName");
const userId = localStorage.getItem("userId");
const roomId = localStorage.getItem("roomId");
let remainTime;
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

socket.on("loadFirstQuizz", (firstQuizz) => {
  console.log(firstQuizz);
  let intervalId;
  let count = 5;
  $(".count-down-wrapper").fadeIn();
  $(".overlay").fadeIn();
  $(".count-down-number").html(count);
  $(".overlay").fadeIn();
  intervalId = setInterval(async function () {
    count--;
    $(".count-down-number").html(count);
    if (count === 0) {
      clearInterval(intervalId);
      $(".count-down-wrapper").fadeOut();
      $(".overlay").fadeOut();
      if (!socket.host) {
        renderQuizzPage(firstQuizz);
      } else {
        renderHostQuizzPage(firstQuizz);
      }
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

const renderQuizzPage = (quizzObj) => {
  $(".container").empty();
  if (["MC-EN", "MC-CH"].includes(quizzObj.type)) {
    const page = `<div id='quiz-container'><div id="count-down-container"><h1 id="quiz-intro">Question ${quizzObj.num}</h1><div id="timer"><div class="bar"></div></div></div><div id='quiz'><h2 id='question'>${quizzObj.question}</h2><ul><li><input type='radio' name='answer' value='A' id='A'><label for='A'>${quizzObj.options["A"]}</label></li>
  <li><input type='radio' name='answer' value='B' id='B'><label for='B'>${quizzObj.options["B"]}</label></li><li>
  <input type='radio' name='answer' value='C' id='C'>
  <label for='C'>${quizzObj.options["C"]}</label></li><li><input type='radio' name='answer' value='D' id='D'><label for='D'>${quizzObj.options["D"]}</label></li></ul></div><div id='scoreboard'><h2>Scoreboard</h2>
  <ol id='scores'></ol></div></div>`;
    $(".container").html(page);
  }
  mutipleChoiceCheck(quizzObj);
  multipleChoiceOnclick(quizzObj);
  countDown(quizzObj.timeLimits);
};

const renderHostQuizzPage = (quizzObj) => {
  $(".container").empty();
  if (["MC-EN", "MC-CH"].includes(quizzObj.type)) {
    const page = `<div id='quiz-container'><div id="count-down-container"><h1 id="quiz-intro">Question ${quizzObj.num}</h1><div id="timer"><div class="bar"></div></div></div><div id='quiz'><h2 id='question'>${quizzObj.question}</h2><ul><li><input type='radio' name='answer' value='A' id='A'><label for='A'>${quizzObj.options["A"]}</label></li>
  <li><input type='radio' name='answer' value='B' id='B'><label for='B'>${quizzObj.options["B"]}</label></li><li>
  <input type='radio' name='answer' value='C' id='C'>
  <label for='C'>${quizzObj.options["C"]}</label></li><li><input type='radio' name='answer' value='D' id='D'><label for='D'>${quizzObj.options["D"]}</label></li></ul><button id="next-quizz-btn">Next question</button></div><div id='scoreboard'><h2>Scoreboard</h2>
  <ol id='scores'></ol></div></div>`;
    $(".container").html(page);
  }
  mutipleChoiceCheck(quizzObj);
  countDown(quizzObj.timeLimits);
};

function multipleChoiceOnclick(quizzObj) {
  $(".container").on("click", "input[name='answer']", async function () {
    $("input[name='answer']").attr("disabled", true);
    const selectedInput = $('input[name="answer"]:checked');
    if (selectedInput.attr("data-state") === "right") {
      selectedInput.next().addClass("right-answer");
      const score = calculateScore(quizzObj.timeLimits, remainTime);
      const result = await axios.post("/api/1.0/score/add", { roomId, score });
      console.log(result.data);
    } else {
      selectedInput.next().addClass("wrong-answer");
      $('input[data-state="right"]').next().addClass("correct-answer");
      const result = await axios.post("/api/1.0/score/add", {
        roomId,
        score: 100,
      });
      console.log(result.data);
    }
    $("input[name='answer']").css("opacity", "0.5");
  });
}

// function multipleChoiceOnclick(quizzObj) {
//   $(".container").on("click", "#submit", async () => {
//     $("#submit").hide();
//     const selectedInput = $('input[name="answer"]:checked');
//     $("input[name='answer']").prop("disabled", true);
//     if (selectedInput.attr("data-state") === "right") {
//       selectedInput.next().addClass("correct-answer");
//       const score = calculateScore(quizzObj.timeLimits, remainTime);
//       const result = await axios.post("/api/1.0/score/add", { roomId, score });
//       console.log(result.data.data);
//     } else {
//       selectedInput.next().addClass("wrong-answer");
//       $('input[data-status="right"]').next().addClass("correct-answer");
//       const result = await axios.post("/api/1.0/score/add", {
//         roomId,
//         score: 100,
//       });
//       console.log(result.data.data);
//     }
//   });
// }

function mutipleChoiceCheck(quizzObj) {
  const { answer } = quizzObj;
  $(".container")
    .find("li input")
    .each(function () {
      if (answer.includes($(this).val())) {
        $(this).attr("data-state", "right");
      }
    });
}

function countDown(timeLimits) {
  let timerId;
  let remainingSeconds = timeLimits;
  timerId = setInterval(async () => {
    const percentage = (remainingSeconds / timeLimits) * 100;
    $("#timer .bar").css("height", percentage + "%");
    remainingSeconds -= 0.05;
    remainTime = remainingSeconds;
    if (remainingSeconds < 0) {
      clearInterval(timerId);
    }
  }, 50);
}

export const calculateScore = (totalTime, remainTime) => {
  const baseScore = 100;
  const timeBonus = Math.round(500 * Math.pow(remainTime / totalTime, 2));
  const score = baseScore + timeBonus;
  return score;
};
