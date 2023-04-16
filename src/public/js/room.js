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

socket.on("loadFirstQuizz", ({ firstQuizz, length }) => {
  console.log(firstQuizz);
  let intervalId;
  socket.score = 0;
  socket.fullScore = length * 600;
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

socket.on("showScoreTable", ([scoreObj, rankResult]) => {
  $(".container").empty();
  console.log(scoreObj, rankResult);
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
    const page = `<div id='quiz-container'><div id='left-bar'><h2 id="quiz-intro">Question ${quizzObj.num}</h2><div id='quiz-type'>Multiple choice !</div><div id="player-score">0</div><div id='score-chart'><div id='score-bar'></div></div></div><div id='quiz'><div id="timer"><div class="bar"></div></div><h2 id='question'>${quizzObj.question}</h2><ul><li><input type='radio' name='answer' value='A' id='A'><label for='A'>${quizzObj.options["A"]}</label></li>
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
    const page = `<div id='quiz-container'><div id='left-bar'><h2 id="quiz-intro">Question ${quizzObj.num}</h2><div id='quiz-type'>Multiple choice !</div></div><div id='quiz'><div id="timer"><div class="bar"></div></div><h2 id='question'>${quizzObj.question}</h2><ul><li><input type='radio' name='answer' value='A' id='A'><label for='A'>${quizzObj.options["A"]}</label></li>
  <li><input type='radio' name='answer' value='B' id='B'><label for='B'>${quizzObj.options["B"]}</label></li><li>
  <input type='radio' name='answer' value='C' id='C'>
  <label for='C'>${quizzObj.options["C"]}</label></li><li><input type='radio' name='answer' value='D' id='D'><label for='D'>${quizzObj.options["D"]}</label></li></ul><button id="next-quizz-btn">Next question</button></div><div id='scoreboard'><h2>Scoreboard</h2>
  <ol id='scores'></ol></div></div>`;
    $(".container").html(page);
  }
  countDown(quizzObj.timeLimits);
};

function multipleChoiceOnclick(quizzObj) {
  $(".container").on("click", "input[name='answer']", async function () {
    $("input[name='answer']").attr("disabled", true);
    const $selectedInput = $('input[name="answer"]:checked');
    if ($selectedInput.attr("data-state") === "right") {
      $('input[data-state="right"]').next().addClass("correct-answer");
      const score = calculateScore(quizzObj.timeLimits, remainTime);
      const result = await axios.post("/api/1.0/score/add", { roomId, score });
      const initvalue = socket.score;
      socket.score += +result.data.score;
      animateScore($("#player-score"), initvalue, socket.score, 1000);
      const percentage = changeSideBar(socket.score);
      socket.scoreBarPercentage = percentage;
    } else {
      $selectedInput.next().addClass("wrong-answer");
      $('input[data-state="right"]').next().addClass("correct-answer");
      const result = await axios.post("/api/1.0/score/add", {
        roomId,
        score: 100,
      });
      const initvalue = socket.score;
      socket.score += +result.data.score;
      animateScore($("#player-score"), initvalue, socket.score, 1000);
      const percentage = changeSideBar(socket.score);
      socket.scoreBarPercentage = percentage;
    }
    socket.emit("getAnswer", $selectedInput.val());
  });
}

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
    $("#timer .bar").css("width", percentage + "%");
    remainingSeconds -= 0.05;
    remainTime = remainingSeconds;
    if (remainingSeconds < 0) {
      clearInterval(timerId);
      if (socket.host) {
        socket.emit("timeout");
      }
    }
  }, 50);
}

const calculateScore = (totalTime, remainTime) => {
  const baseScore = 100;
  const timeBonus = Math.round(500 * Math.pow(remainTime / totalTime, 2));
  const score = baseScore + timeBonus;
  return score;
};

function changeSideBar(score) {
  const scoreDivide = (score / socket.fullScore) * 100;
  const scorePercentage = scoreDivide + "%";
  $("#score-bar").animate({ height: scorePercentage }, 1000);
  return scorePercentage;
}

function animateScore($element, initvalue, toValue, duration) {
  $({ value: initvalue }).animate(
    { value: toValue },
    {
      duration: duration,
      step: function () {
        $element.text(Math.floor(this.value));
      },
    }
  );
}
