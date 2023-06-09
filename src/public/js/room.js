const socket = io();
const userName = localStorage.getItem("userName");
const userId = localStorage.getItem("userId");
import { Queue } from "./util/queue.js";
const url = window.location.href;
const regex = /\/(\d+)$/;
const match = url.match(regex);
const roomId = match[1];
const quizTypeTransform = {
  "MC-EN": "MULTIPLE CHOICE",
  "MC-CH": "MULTIPLE CHOICE",
  "TF-EN": "TRUE OR FALSE",
  "TF-CH": "TRUE OR FALSE",
  "MCS-EN": "MULTIPLE CHOICE",
  "MCS-CH": "MULTIPLE CHOICE",
};
$(window).on("load", function () {
  setTimeout(async () => {
    $(".block").hide();
    $("#entering").hide();
    $("#controller").show();
    const isDisconnectUser = await axios.get(
      `/api/1.0/game/disconnect?roomId=${roomId}`
    );
    if (isDisconnectUser.data.data == "disconnection") {
      $(".block").show();
      $("#reconnect").show();
      socket.disconnect = true;
    }
  }, 1500);
});
const clipboard = new ClipboardJS(".click-btn");
const hostName = window.location.hostname;
$("#copy-url").val(`https://${hostName}/game/fastenter/${roomId}`);

$(".click-btn").on("click", () => {
  Toast.fire({
    icon: "success",
    title: `Url copied !`,
  });
});

const rankQueue = new Queue();
socket.emit("join", { userName, userId, roomId });

$(".cancel-reconnecting").on("click", () => {
  window.location.href = "/";
});

const timeIdArray = [];
Highcharts.setOptions({
  colors: Highcharts.map(Highcharts.getOptions().colors, function (color) {
    return {
      radialGradient: {
        cx: 0.5,
        cy: 0.3,
        r: 0.7,
      },
      stops: [
        [0, color],
        [1, Highcharts.color(color).brighten(-0.3).get("rgb")], // darken
      ],
    };
  }),
});

const canvas = $("#canvas")[0];
const ctx = canvas.getContext("2d");

canvas.width = window.outerWidth;
canvas.height = window.outerWidth;

const stars = [];

function init() {
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 1.5;
    stars.push({ x, y, radius });
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0e1a3c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < stars.length; i++) {
    ctx.beginPath();
    ctx.arc(stars[i].x, stars[i].y, stars[i].radius, 0, Math.PI * 2);
    ctx.fillStyle = stars[i].color || "#ffffff";
    ctx.fill();
  }
}

function animate() {
  requestAnimationFrame(animate);
  draw();
}

init();
animate();

socket.on("message", async (welcomeString) => {
  const gameNameResult = await axios.get(`/api/1.0/game/name?roomId=${roomId}`);
  const gameName = gameNameResult.data.data;
  $("h2").text(welcomeString);
  $("h1").text(gameName);
});
socket.on("welcomeMessage", async () => {
  const gameNameResult = await axios.get(`/api/1.0/game/name?roomId=${roomId}`);
  const gameName = gameNameResult.data.data;
  $("h2").text("Waiting for more players.");
  $("h1").text(gameName);
});

socket.on("showControllerInterface", (host) => {
  const $startButton = $('<button id="start-game-btn">Start the game</button>');
  $("#host").text(`Host: ${host.userName}  roomId: ${host.roomId}`);
  socket.host = true;
  $(".url-container").append($startButton);
});

socket.on("userJoined", ([host, users]) => {
  $("#host").text(`Host: ${host.userName}, roomId: ${host.roomId}`);
  $("#player-list").empty();
  users.forEach((user) => {
    const { userName } = user;
    const $userDiv = $(`<div>${userName}</div>`);
    $("#player-list").append($userDiv);
  });
});

socket.on("userLeft", (users) => {
  $("#player-list").empty();
  users.forEach((user) => {
    const { userName } = user;
    const $userDiv = $(`<div>${userName}</div>`);
    $("#player-list").append($userDiv);
  });
});

socket.on("wattingForConnect", () => {
  $("#reconnect").show();
});

$(".container").on("click", "#start-game-btn", () => {
  if ($("#player-list").children().length == 0) {
    return Toast.fire({
      icon: "error",
      title: `Wait more players to join !`,
    });
  }

  socket.emit("startGame");
});

socket.on("loadFirstQuiz", ({ firstQuiz, length, rankResult }) => {
  if (socket.disconnect) {
    $(".block").hide();
    $("#reconnect").hide();
    socket.disconnect = false;
  }
  if (firstQuiz.lastquiz) socket.lastquiz = true;
  localStorage.setItem("quizDetail", JSON.stringify(firstQuiz));
  let intervalId;
  socket.score = 0;
  socket.fullScore = length * 500;
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
        $("canvas").hide();
        $(".star-container").show();
        renderQuizPage(firstQuiz, rankResult);
      } else {
        $("canvas").hide();
        $(".star-container").show();
        renderHostQuizPage(firstQuiz, rankResult);
      }
      socket.quizNum = 2;
    }
  }, 1000);
});

socket.on("showQuiz", ({ quiz, quizNum, quizLength, rankResult }) => {
  if (socket.disconnect) {
    socket.score = 0;
    socket.quizNum = quizNum;
    socket.fullScore = quizLength * 500;
    $(".container").html(`<div id="quiz-container">
  <div id="left-bar">
    <h2 id="quiz-intro"></h2>
    <div id="quiz-type"></div>
    <div id="player-score">0</div>
    <div id="score-chart"><div id="score-bar"></div></div>
  </div>
  <div id="quiz">
  </div>
  <div id="scoreboard">
    <h2>Scoreboard</h2>
    <div id="sort-container"></div>
  </div>
</div>`);
    $(".block").hide();
    $("canvas").hide();
    $(".star-container").show();
    $("#reconnect").hide();
    sortPlayers(rankResult);
    socket.disconnect = false;
  }
  localStorage.setItem("quizDetail", JSON.stringify(quiz));
  if (quiz.lastquiz) socket.lastquiz = true;
  quizShow(quiz);
  $("#show-answer").show();
  $("#quiz-intro").text(`Question${quizNum}`);
  $("#quiz-type").text(quizTypeTransform[quiz.type]);
  socket.quizNum += 1;
});

socket.on("showFinalScore", (rank) => {
  if (socket.disconnect) {
    $(".container").empty();
    $(".container").html(`<div id="quiz-container">
  <div id="left-bar">
    <h2 id="quiz-intro"></h2>
    <div id="quiz-type"></div>
    <div id="player-score">0</div>
    <div id="score-chart"><div id="score-bar"></div></div>
  </div>
  <div id="quiz">
  </div>
  <div id="scoreboard">
    <h2>Scoreboard</h2>
    <div id="sort-container"></div>
  </div>
</div>`);
    $(".block").hide();
    $("canvas").hide();
    $("body").css("background-image", 'url("/img/rankpage.jpg")');
    $(".star-container").hide();
    $(".night").show();
    $("#reconnect").hide();
    socket.disconnect = false;
  }
  $("body").css("background-image", 'url("/img/rankpage.jpg")');
  $("#quiz").css("justify-content", "flex-start");
  $(".star-container").hide();
  $(".night").show();
  showRank(rank);
});

socket.on("hostLeave", () => {
  if (socket.disconnection) {
    $(".block").hide();
    $("#reconnect").hide();
  }
  if (!socket.host) {
    $("#host-leave-room-popup").show();
  }
});

socket.on("showQuizExplain", (scoreObj) => {
  sortScores();
  $("#quiz").empty();
  const parseQuizObject = JSON.parse(localStorage.getItem("quizDetail"));
  const correctAnswer = parseQuizObject.answer.join(" ");
  const explain = parseQuizObject.explain;
  const $correctText = $("<h2>");
  const $correctAnswer = $correctText.text(`Correct Answer:  ${correctAnswer}`);
  // const $correctAnswer = $(`<h2>Correct Answer:  ${correctAnswer}</h2>`);
  const $explain = $(`<h3>Explaination <p></p></h3>`);
  $("#quiz").append($correctAnswer);
  $("#quiz").append($explain);
  $("h3 p").text(explain);
  generateChart(scoreObj);
  localStorage.removeItem("quizDetail");
  if (socket.host) {
    $("#show-answer").hide();
    if (socket.lastquiz) {
      const $showFinalScore = $(
        '<button id="show-final-score">Show final result</button>'
      );
      $("#quiz").append($showFinalScore);
    } else {
      const $nextGameButton = $(
        '<button id="next-game-btn">Next quiz</button>'
      );
      $("#quiz").append($nextGameButton);
    }
  }
});

socket.on("clearCountdown", () => {
  clearCountDown(timeIdArray);
});

$(".back-to-main-btn").on("click", () => {
  window.location.href = "/";
});

$(".leave-game-btn").on("click", () => {
  $("#leave-room-popup").show();
});

$(".pop-yes-button").on("click", () => {
  window.location.href = "/";
});
$(".pop-no-button").on("click", () => {
  $("#leave-room-popup").hide();
});

$(".container").on("click", "#next-game-btn", () => {
  const { quizNum } = socket;
  socket.emit("nextQuiz", quizNum);
});

$(".container").on("click", "#show-answer", () => {
  $("#show-answer").hide();
  socket.emit("earlyTimeout");
});

$(".container").on("click", "#show-final-score", () => {
  socket.emit("showFinal");
});

const $countdown = $(
  `<div class="overlay"></div><div class="count-down-wrapper">
  <div class="count-down-radar"><div class="count-down-number">5</div></div>
</div>`
);
$(".container").after($countdown);

socket.on("updateRankAndScore", ({ score, userId }) => {
  const sortPlayerRank = function (callback) {
    $(`.sort-player-score[data-id=${userId}]`).text(score);
    sortScores();
    setTimeout(() => {
      callback();
    }, 500);
  };
  rankQueue.add(sortPlayerRank);
});

function showRank(players) {
  $("#quiz").off().empty();
  const $ranking = $("<h1>RANKING</h1>");
  $("#quiz").append($ranking);
  const $rankings = $(".rankings");
  $("#left-bar").hide();
  $("#scoreboard").hide();
  let rankNum = 1;
  players.forEach((player) => {
    const $player = $(`<div class="ranking">
      <div class="player-rank">${rankNum}</div>
      <div class="player-name">${player.name}</div>
      <div class="player-score">${player.score}</div>
    </div>`);
    $rankings.append($player);
    $("#quiz").append($player);
    rankNum++;
  });
}

const quizShow = (quizObj) => {
  $("#quiz").off().empty();
  if (["MC-EN", "MC-CH"].includes(quizObj.type)) {
    const page =
      $(`<div id="timer"><div class="bar"></div></div><h2 id="question"></h2><ul><li><input type="radio" name="answer" value="A" id="A" /><label for="A"></label></li><li>
    <input type="radio" name="answer" value="B" id="B" /><label for="B"></label></li><li><input type="radio" name="answer" value="C" id="C" /><label for="C"></label></li><li>
    <input type="radio" name="answer" value="D" id="D" /><label for="D"></label></li></ul>`);
    $("#quiz").html(page);
    $("#question").text(quizObj.question);
    $("#A + label").text(quizObj.options["A"]);
    $("#B + label").text(quizObj.options["B"]);
    $("#C + label").text(quizObj.options["C"]);
    $("#D + label").text(quizObj.options["D"]);
    countDown(quizObj.timeLimits);
    mutipleChoiceCheck(quizObj, $("#quiz"));
    multipleChoiceOnclick(quizObj, $("#quiz"));
    return;
  }
  if (["TF-EN", "TF-CH"].includes(quizObj.type)) {
    const page = `<div id="timer"><div class="bar"></div></div><h2 id="question"></h2>
    <div class="t-f-container" data><div class="t-f" data-value="true"><h2>True</h2></div>
    <div class="t-f" data-value="false"><h2>False</h2></div></div>`;
    $("#quiz").html(page);
    $("#question").text(quizObj.question);
    countDown(quizObj.timeLimits);
    trueFalseOnClick(quizObj, $("#quiz"));
    return;
  }
  if (["MCS-EN", "MCS-CH"].includes(quizObj.type)) {
    const page =
      $(`<div id="timer"><div class="bar"></div></div><h2 id="question"></h2>
    <ul><li><input type="checkbox" name="answer" value="A" id="A" /><label for="A"></label>
    </li><li><input type="checkbox" name="answer" value="B" id="B" /><label for="B"></label>
    </li><li><input type="checkbox" name="answer" value="C" id="C" /><label for="C"></label>
    </li><li><input type="checkbox" name="answer" value="D" id="D" /><label for="D"></label>
    </li></ul><div class="submit-mcs-answer">Submit</div>`);
    $("#quiz").html(page);
    $("#question").text(quizObj.question);
    $("#A + label").text(quizObj.options["A"]);
    $("#B + label").text(quizObj.options["B"]);
    $("#C + label").text(quizObj.options["C"]);
    $("#D + label").text(quizObj.options["D"]);
    countDown(quizObj.timeLimits);
    mutipleChoiceCheck(quizObj, $("#quiz"));
    multipleChoicesOnclick(quizObj, $("#quiz"));
    return;
  }
};

const renderQuizPage = (quizObj, rankResult) => {
  $(".container").empty();
  let $quiz;
  if (["MC-EN", "MC-CH"].includes(quizObj.type)) {
    const page = `<div id='quiz-container'><div id='left-bar'><h2 id="quiz-intro"></h2><div id='quiz-type'>Multiple choice</div><div id="player-score">0</div><div id='score-chart'><div id='score-bar'></div></div></div><div id='quiz'><div id="timer"><div class="bar"></div></div><h2 id='question'></h2><ul><li><input type='radio' name='answer' value='A' id='A'><label for='A'></label></li>
    <li><input type='radio' name='answer' value='B' id='B'><label for='B'></label></li><li>
    <input type='radio' name='answer' value='C' id='C'>
    <label for='C'></label></li><li><input type='radio' name='answer' value='D' id='D'><label for='D'></label></li></ul></div><div id='scoreboard'><h2>Scoreboard</h2>
    <div id='sort-container'></div></div>`;
    $(".container").html(page);
    $("#quiz-intro").text(`Question ${quizObj.num}`);
    $("#question").text(quizObj.question);
    $("#A + label").text(quizObj.options["A"]);
    $("#B + label").text(quizObj.options["B"]);
    $("#C + label").text(quizObj.options["C"]);
    $("#D + label").text(quizObj.options["D"]);
    $quiz = $(".container").find("#quiz");
    countDown(quizObj.timeLimits);
    mutipleChoiceCheck(quizObj, $quiz);
    multipleChoiceOnclick(quizObj, $quiz);
    sortPlayers(rankResult);
    return;
  }
  if (["TF-EN", "TF-CH"].includes(quizObj.type)) {
    const page = `<div id="quiz-container"><div id="left-bar"><h2 id="quiz-intro"></h2>
    <div id="quiz-type">True or False</div><div id="player-score">0</div>
    <div id="score-chart"><div id="score-bar"></div></div></div><div id="quiz">
    <div id="timer"><div class="bar"></div></div><h2 id="question"></h2>
    <div class="t-f-container" data><div class="t-f" data-value="true"><h2>True</h2></div>
    <div class="t-f" data-value="false"><h2>False</h2></div></div></div><div id="scoreboard">
    <h2>Scoreboard</h2><div id="sort-container"></div></div></div>`;
    $(".container").html(page);
    $("#quiz-intro").text(`Question ${quizObj.num}`);
    $("#question").text(quizObj.question);
    $quiz = $(".container").find("#quiz");
    countDown(quizObj.timeLimits);
    trueFalseOnClick(quizObj, $quiz);
    sortPlayers(rankResult);
    return;
  }
  if (["MCS-EN", "MCS-CH"].includes(quizObj.type)) {
    const page = `<div id="quiz-container"><div id="left-bar"><h2 id="quiz-intro"></h2>
    <div id="quiz-type">Multiple Choice</div><div id="player-score">0</div>
    <div id="score-chart"><div id="score-bar"></div></div></div><div id="quiz">
    <div id="timer"><div class="bar"></div></div><h2 id="question"></h2>
    <ul><li><input type="checkbox" name="answer" value="A" id="A" /><label for="A"></label>
    </li><li><input type="checkbox" name="answer" value="B" id="B" /><label for="B"></label>
    </li><li><input type="checkbox" name="answer" value="C" id="C" /><label for="C"></label>
    </li><li><input type="checkbox" name="answer" value="D" id="D" /><label for="D"></label>
    </li></ul><div class="submit-mcs-answer">Submit</div></div><div id="scoreboard"><h2>Scoreboard</h2>
    <div id="sort-container"></div></div></div>`;
    $(".container").html(page);
    $("#quiz-intro").text(`Question ${quizObj.num}`);
    $("#question").text(quizObj.question);
    $("#A + label").text(quizObj.options["A"]);
    $("#B + label").text(quizObj.options["B"]);
    $("#C + label").text(quizObj.options["C"]);
    $("#D + label").text(quizObj.options["D"]);
    $quiz = $(".container").find("#quiz");
    countDown(quizObj.timeLimits);
    mutipleChoiceCheck(quizObj, $quiz);
    multipleChoicesOnclick(quizObj, $quiz);
    sortPlayers(rankResult);
    return;
  }
};

const renderHostQuizPage = (quizObj, rankResult) => {
  $(".container").empty();
  if (["MC-EN", "MC-CH"].includes(quizObj.type)) {
    const page = `<div id='quiz-container'><div id='left-bar'><h2 id="quiz-intro"></h2><div id='quiz-type'>Multiple choice</div><button id="show-answer">Show answer</button></div><div id='quiz'><div id="timer"><div class="bar"></div></div><h2 id='question'></h2><ul><li><input type='radio' name='answer' value='A' id='A'><label for='A'></label></li>
  <li><input type='radio' name='answer' value='B' id='B'><label for='B'></label></li><li>
  <input type='radio' name='answer' value='C' id='C'>
  <label for='C'></label></li><li><input type='radio' name='answer' value='D' id='D'><label for='D'></label></li></ul></div><div id='scoreboard'><h2>Scoreboard</h2>
  <div id='sort-container'></div></div>`;
    $(".container").html(page);
    $("#quiz-intro").text(`Question ${quizObj.num}`);
    $("#question").text(quizObj.question);
    $("#A + label").text(quizObj.options["A"]);
    $("#B + label").text(quizObj.options["B"]);
    $("#C + label").text(quizObj.options["C"]);
    $("#D + label").text(quizObj.options["D"]);
  }
  if (["TF-EN", "TF-CH"].includes(quizObj.type)) {
    const page = `<div id="quiz-container"><div id="left-bar"><h2 id="quiz-intro"></h2>
    <div id="quiz-type">True or False</div><button id="show-answer">Show answer</button></div><div id="quiz"><div id="timer"><div class="bar"></div></div>
    <h2 id="question"></h2><div class="t-f-container" data><div class="t-f" data-value="true"><h2>True</h2></div><div class="t-f" data-value="false"><h2>False</h2></div></div></div>
    <div id="scoreboard"><h2>Scoreboard</h2><div id="sort-container"></div></div></div>`;
    $(".container").html(page);
    $("#quiz-intro").text(`Question ${quizObj.num}`);
    $("#question").text(quizObj.question);
  }
  if (["MCS-EN", "MCS-CH"].includes(quizObj.type)) {
    const page = `<div id="quiz-container"><div id="left-bar"><h2 id="quiz-intro"></h2>
    <div id="quiz-type">Multiple Choice</div><button id="show-answer">Show answer</button>
    <div id="player-score">0</div><div id="score-chart"><div id="score-bar"></div></div></div><div id="quiz">
    <div id="timer"><div class="bar"></div></div><h2 id="question"></h2>
    <ul><li><input type="checkbox" name="answer" value="A" id="A" /><label for="A"></label>
    </li><li><input type="checkbox" name="answer" value="B" id="B" /><label for="B"></label>
    </li><li><input type="checkbox" name="answer" value="C" id="C" /><label for="C"></label>
    </li><li><input type="checkbox" name="answer" value="D" id="D" /><label for="D"></label>
    </li></ul></div><div id="scoreboard"><h2>Scoreboard</h2><div id="sort-container"></div></div></div>`;
    $(".container").html(page);
    $("#quiz-intro").text(`Question ${quizObj.num}`);
    $("#question").text(quizObj.question);
    $("#A + label").text(quizObj.options["A"]);
    $("#B + label").text(quizObj.options["B"]);
    $("#C + label").text(quizObj.options["C"]);
    $("#D + label").text(quizObj.options["D"]);
  }
  countDown(quizObj.timeLimits);
  sortPlayers(rankResult);
};

$(".entering").on("click", () => {
  window.location.href = "/";
});
function trueFalseOnClick(quizObj, $element) {
  $element.on("click", ".t-f", async function () {
    $(".t-f").prop("disabled", true);
    const chooseOption = $(this).data("value");
    const initvalue = socket.score;
    if (chooseOption === quizObj.answer[0]) {
      $(this).addClass("correct-answer");
      $(".t-f").addClass("tf-no-hover");
      const score = calculateScore(quizObj.timeLimits, socket.remainTime);
      const result = await axios.put("/api/1.0/score/add", {
        roomId,
        score,
      });
      const addScore = +result.data.score;
      socket.score = addScore;
      animateScore($("#player-score"), initvalue, socket.score, 700);
      changeSideBar(socket.score);
    } else {
      $(this).addClass("wrong-answer");
      $(".t-f").addClass("tf-no-hover");
    }
    setTimeout(() => {
      socket.emit("getAnswer", {
        chooseOption: [chooseOption],
        score: socket.score,
        quizNum: socket.quizNum,
      });
    }, 500);
  });
}

function multipleChoicesOnclick(quizObj, $element) {
  $element.on("click", 'input[type="checkbox"]', function () {
    $(this).next().toggleClass("mcs-checked");
  });
  $element.on("click", ".submit-mcs-answer", async function () {
    $("input[type='checkbox']").prop("disabled", true);
    $(this).prop("disabled", true);
    let rightoptions = 0;
    let finalScore = 0;
    const initvalue = socket.score;
    $("input[type='checkbox']").each(async function () {
      if (
        $(this).attr("data-state") === "right" &&
        $(this).next().hasClass("mcs-checked")
      ) {
        $(this).next().addClass("correct-answer");
        rightoptions += 1;
      }
      if (
        $(this).attr("data-state") === "right" &&
        !$(this).next().hasClass("mcs-checked")
      ) {
        $(this).next().addClass("wrong-answer");
        rightoptions -= 1;
      }
      if (
        $(this).next().hasClass("mcs-checked") &&
        !$(this).attr("data-state")
      ) {
        $(this).next().addClass("wrong-answer");
        rightoptions -= 1;
      }
    });
    const score = calculateScore(quizObj.timeLimits, socket.remainTime);
    if (rightoptions > 0) {
      finalScore = Math.floor(rightoptions * score * 0.8);
      const result = await axios.put("/api/1.0/score/add", {
        roomId,
        score: finalScore,
      });
      const addScore = +result.data.score;
      socket.score = addScore;
      animateScore($("#player-score"), initvalue, socket.score, 700);
      changeSideBar(socket.score);
    }
    const optionArray = [];
    $(".mcs-checked")
      .prev()
      .each(function () {
        optionArray.push($(this).val());
      });
    setTimeout(() => {
      socket.emit("getAnswer", {
        chooseOption: optionArray,
        score: socket.score,
        quizNum: socket.quizNum,
      });
    }, 500);
  });
}

function multipleChoiceOnclick(quizObj, $element) {
  $element.on("click", "input[name='answer']", async function () {
    $("input[name='answer']").attr("disabled", true);
    const $selectedInput = $('input[name="answer"]:checked');
    const chooseOption = $('input[name="answer"]:checked').val();
    const initvalue = socket.score;
    if ($selectedInput.attr("data-state") === "right") {
      $('input[data-state="right"]').next().addClass("correct-answer");
      const score = calculateScore(quizObj.timeLimits, socket.remainTime);
      const result = await axios.put("/api/1.0/score/add", { roomId, score });
      const addScore = +result.data.score;
      socket.score = addScore;
      animateScore($("#player-score"), initvalue, socket.score, 700);
      changeSideBar(socket.score);
    } else {
      $selectedInput.next().addClass("wrong-answer");
    }
    setTimeout(() => {
      socket.emit("getAnswer", {
        chooseOption: [chooseOption],
        score: socket.score,
        quizNum: socket.quizNum,
      });
    }, 500);
  });
}

function mutipleChoiceCheck(quizObj, $element) {
  const { answer } = quizObj;
  $element.find("li input").each(function () {
    if (answer.includes($(this).val())) {
      $(this).attr("data-state", "right");
    }
  });
}

function countDown(timeLimits) {
  let timerId;
  let remainingSeconds = timeLimits;
  timerId = setInterval(async () => {
    let percentage = (remainingSeconds / timeLimits) * 100;
    $("#timer .bar").css("width", percentage + "%");
    remainingSeconds -= 0.05;
    socket.remainTime = remainingSeconds;
    if (remainingSeconds < 0) {
      clearInterval(timerId);
      timeIdArray.pop();
      if (socket.host) {
        socket.emit("timeout");
      }
    }
  }, 50);
  timeIdArray.push(timerId);
}
function clearCountDown(timeIdArray) {
  timeIdArray.forEach((timeId) => {
    clearInterval(timeId);
    timeIdArray.pop();
  });
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
  $("#score-bar").animate({ height: scorePercentage }, 500);
  return scorePercentage;
}

function animateScore($element, initvalue, toValue, duration) {
  $({ value: initvalue }).animate(
    { value: toValue + 1 },
    {
      duration: duration,
      step: function () {
        $element.text(Math.floor(this.value));
      },
    }
  );
}

function sortPlayers(players) {
  players.forEach((player) => {
    const $player = $(
      `<div class='sort-player'>${player.name}<div class='sort-player-score' data-id="${player.id}">${player.score}</div></div>`
    );
    $("#sort-container").append($player);
  });
}

function sortScores() {
  const container = $("#sort-container");
  const items = container.find(".sort-player");

  items.sort(function (a, b) {
    const scoreA = parseInt($(a).find(".sort-player-score").text());
    const scoreB = parseInt($(b).find(".sort-player-score").text());
    return scoreA < scoreB ? 1 : scoreA > scoreB ? -1 : 0;
  });

  items.each(function (index) {
    const currentPosition = $(this).position();
    const newPosition = {
      top: index * ($(this).outerHeight() + 10) + "px",
    };
    $(this)
      .css({
        position: "absolute",
        left: currentPosition.left,
        top: currentPosition.top,
      })
      .animate(newPosition, 500);
  });
}

function generateChart(object) {
  const $chartContainer = $(
    '<div id="chart" style="width: 60%; height: 60%"></div>'
  );
  $("#quiz").append($chartContainer);
  const dataArray = [];
  for (let i in object) {
    dataArray.push({ name: i, y: object[i] });
  }
  Highcharts.chart("chart", {
    chart: {
      backgroundColor: "transparent",
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: "pie",
    },
    credits: {
      enabled: false,
    },
    title: {
      text: "Answer Analysis",
      style: {
        color: "white",
        fontWeight: "bold",
      },
    },
    tooltip: {
      pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>",
    },
    accessibility: {
      point: {
        valueSuffix: "%",
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "<b>{point.name}</b>: {point.y}",
          connectorColor: "silver",
        },
        colors: ["#34BABD", "#A6DBCC", "#5398E2", "#5362E2", "#204E77"],
      },
    },
    series: [
      {
        name: "Share",
        data: dataArray,
      },
    ],
  });
}

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});
