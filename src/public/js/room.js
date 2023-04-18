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
  $("#host").text(`Host: ${host.userName}, roomId: ${host.roomId}`);
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

socket.on("loadFirstQuizz", ({ firstQuizz, length, rankResult }) => {
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
        renderQuizzPage(firstQuizz, rankResult);
      } else {
        renderHostQuizzPage(firstQuizz, rankResult);
      }
      socket.quiz = 2;
      // 進到第二題
    }
  }, 1000);
});

socket.on("showQuiz", (quiz) => {
  if (quiz.lastquizz) socket.lastquizz = true;
  quizShow(quiz);
  $("#quiz-intro").text(`Question${socket.quiz}`);
  socket.quiz += 1;
});

socket.on("showFinalScore", (rank) => {
  showRank(rank);
});
socket.on("showScoreTable", ({ scoreObj, rankResult }) => {
  $("#quiz").empty();
  // const parseScoreObj = JSON.parse(scoreObj);
  // const parseRankResult = JSON.parse(rankResult);
  console.log(scoreObj, rankResult);
  if (socket.host) {
    const $nextGameButton = $('<button id="next-game-btn">Next quiz</button>');
    $("#quiz").append($nextGameButton);
  }
});

$(".container").on("click", "#next-game-btn", () => {
  const quizNum = socket.quiz;
  socket.emit("nextQuiz", quizNum);
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

socket.on("updateRankAndScore", ({ initvalue, score, userId }) => {
  animateScore(
    $(`.sort-player-score[data-id=${userId}]`),
    initvalue,
    score,
    1000
  );
  $(`.sort-player-score[data-id=${userId}]`).text(score);
  sortScores();
});

function showRank(players) {
  $("#quiz").off().empty();
  const $rankings = $(".rankings");
  players.forEach((player) => {
    const $player = $(`<div class="ranking">
      <div class="player-name">${player.name}</div>
      <div class="player-score">${player.score}</div>
    </div>`);
    $rankings.append($player);
    $("#quiz").append($player);
  });
}

const quizShow = (quizzObj) => {
  $("#quiz").off().empty();
  if (["MC-EN", "MC-CH"].includes(quizzObj.type)) {
    const page =
      $(`<div id="timer"><div class="bar"></div></div><h2 id="question">${quizzObj.question}</h2><ul><li><input type="radio" name="answer" value="A" id="A" /><label for="A">${quizzObj.options["A"]}</label></li><li>
    <input type="radio" name="answer" value="B" id="B" /><label for="B">${quizzObj.options["B"]}</label></li><li><input type="radio" name="answer" value="C" id="C" /><label for="C">${quizzObj.options["C"]}</label></li><li>
    <input type="radio" name="answer" value="D" id="D" /><label for="D">${quizzObj.options["D"]}</label></li></ul>`);
    $("#quiz").html(page);
    countDown(quizzObj.timeLimits);
    mutipleChoiceCheck(quizzObj, $("#quiz"));
    multipleChoiceOnclick(quizzObj, $("#quiz"));
    return;
  }
  if (["TF-EN", "TF-CH"].includes(quizzObj.type)) {
    const page = `<div id="timer"><div class="bar"></div></div><h2 id="question">${quizzObj.question}</h2>
    <div class="t-f-container" data><div class="t-f" data-value="true"><h2>True</h2></div>
    <div class="t-f" data-value="false"><h2>False</h2></div></div>`;
    $("#quiz").html(page);
    countDown(quizzObj.timeLimits);
    trueFalseOnClick(quizzObj, $("#quiz"));
    return;
  }
  if (["MCS-EN", "MCS-CH"].includes(quizzObj.type)) {
    const page =
      $(`<div id="timer"><div class="bar"></div></div><h2 id="question">${quizzObj.question}</h2>
    <ul><li><input type="checkbox" name="answer" value="A" id="A" /><label for="A">${quizzObj.options["A"]}</label>
    </li><li><input type="checkbox" name="answer" value="B" id="B" /><label for="B">${quizzObj.options["B"]}</label>
    </li><li><input type="checkbox" name="answer" value="C" id="C" /><label for="C">${quizzObj.options["C"]}</label>
    </li><li><input type="checkbox" name="answer" value="D" id="D" /><label for="D">${quizzObj.options["D"]}</label>
    </li></ul><div class="submit-mcs-answer">Submit</div>`);
    $("#quiz").html(page);
    countDown(quizzObj.timeLimits);
    mutipleChoiceCheck(quizzObj, $("#quiz"));
    multipleChoicesOnclick(quizzObj, $("#quiz"));
    return;
  }
};

const renderQuizzPage = (quizzObj, rankResult) => {
  $(".container").empty();
  let $quiz;
  if (["MC-EN", "MC-CH"].includes(quizzObj.type)) {
    const page = `<div id='quiz-container'><div id='left-bar'><h2 id="quiz-intro">Question ${quizzObj.num}</h2><div id='quiz-type'>Multiple choice</div><div id="player-score">0</div><div id='score-chart'><div id='score-bar'></div></div></div><div id='quiz'><div id="timer"><div class="bar"></div></div><h2 id='question'>${quizzObj.question}</h2><ul><li><input type='radio' name='answer' value='A' id='A'><label for='A'>${quizzObj.options["A"]}</label></li>
    <li><input type='radio' name='answer' value='B' id='B'><label for='B'>${quizzObj.options["B"]}</label></li><li>
    <input type='radio' name='answer' value='C' id='C'>
    <label for='C'>${quizzObj.options["C"]}</label></li><li><input type='radio' name='answer' value='D' id='D'><label for='D'>${quizzObj.options["D"]}</label></li></ul></div><div id='scoreboard'><h2>Scoreboard</h2>
    <div id='sort-container'></div></div>`;
    $(".container").html(page);
    $quiz = $(".container").find("#quiz");
    countDown(quizzObj.timeLimits);
    mutipleChoiceCheck(quizzObj, $quiz);
    multipleChoiceOnclick(quizzObj, $quiz);
    sortPlayers(rankResult);
    return;
  }
  if (["TF-EN", "TF-CH"].includes(quizzObj.type)) {
    const page = `<div id="quiz-container"><div id="left-bar"><h2 id="quiz-intro">Question ${quizzObj.num}</h2>
    <div id="quiz-type">True or False</div><div id="player-score">0</div>
    <div id="score-chart"><div id="score-bar"></div></div></div><div id="quiz">
    <div id="timer"><div class="bar"></div></div><h2 id="question">${quizzObj.question}</h2>
    <div class="t-f-container" data><div class="t-f" data-value="true"><h2>True</h2></div>
    <div class="t-f" data-value="false"><h2>False</h2></div></div></div><div id="scoreboard">
    <h2>Scoreboard</h2><div id="sort-container"></div></div></div>`;
    $(".container").html(page);
    $quiz = $(".container").find("#quiz");
    countDown(quizzObj.timeLimits);
    trueFalseOnClick(quizzObj, $quiz);
    sortPlayers(rankResult);
    return;
  }
  if (["MCS-EN", "MCS-CH"].includes(quizzObj.type)) {
    const page = `<div id="quiz-container"><div id="left-bar"><h2 id="quiz-intro">Question ${quizzObj.num}</h2>
    <div id="quiz-type">Multiple Choice</div><div id="player-score">0</div>
    <div id="score-chart"><div id="score-bar"></div></div></div><div id="quiz">
    <div id="timer"><div class="bar"></div></div><h2 id="question">${quizzObj.question}</h2>
    <ul><li><input type="checkbox" name="answer" value="A" id="A" /><label for="A">${quizzObj.options["A"]}</label>
    </li><li><input type="checkbox" name="answer" value="B" id="B" /><label for="B">${quizzObj.options["B"]}</label>
    </li><li><input type="checkbox" name="answer" value="C" id="C" /><label for="C">${quizzObj.options["C"]}</label>
    </li><li><input type="checkbox" name="answer" value="D" id="D" /><label for="D">${quizzObj.options["D"]}</label>
    </li></ul><div class="submit-mcs-answer">Submit</div></div><div id="scoreboard"><h2>Scoreboard</h2>
    <div id="sort-container"></div></div></div>`;
    $(".container").html(page);
    $quiz = $(".container").find("#quiz");
    countDown(quizzObj.timeLimits);
    mutipleChoiceCheck(quizzObj, $quiz);
    multipleChoicesOnclick(quizzObj, $quiz);
    sortPlayers(rankResult);
    return;
  }
};

const renderHostQuizzPage = (quizzObj, rankResult) => {
  $(".container").empty();
  if (["MC-EN", "MC-CH"].includes(quizzObj.type)) {
    const page = `<div id='quiz-container'><div id='left-bar'><h2 id="quiz-intro">Question ${quizzObj.num}</h2><div id='quiz-type'>Multiple choice</div></div><div id='quiz'><div id="timer"><div class="bar"></div></div><h2 id='question'>${quizzObj.question}</h2><ul><li><input type='radio' name='answer' value='A' id='A'><label for='A'>${quizzObj.options["A"]}</label></li>
  <li><input type='radio' name='answer' value='B' id='B'><label for='B'>${quizzObj.options["B"]}</label></li><li>
  <input type='radio' name='answer' value='C' id='C'>
  <label for='C'>${quizzObj.options["C"]}</label></li><li><input type='radio' name='answer' value='D' id='D'><label for='D'>${quizzObj.options["D"]}</label></li></ul></div><div id='scoreboard'><h2>Scoreboard</h2>
  <div id='sort-container'></div></div>`;
    $(".container").html(page);
  }
  if (["TF-EN", "TF-CH"].includes(quizzObj.type)) {
    const page = `<div id="quiz-container"><div id="left-bar"><h2 id="quiz-intro">Question ${quizzObj.num}</h2>
    <div id="quiz-type">True or False</div></div><div id="quiz"><div id="timer"><div class="bar"></div></div>
    <h2 id="question">${quizzObj.question}</h2><div class="t-f-container" data><div class="t-f" data-value="true"><h2>True</h2></div><div class="t-f" data-value="false"><h2>False</h2></div></div></div>
    <div id="scoreboard"><h2>Scoreboard</h2><div id="sort-container"></div></div></div>`;
    $(".container").html(page);
  }
  if (["MCS-EN", "MCS-CH"].includes(quizzObj.type)) {
    const page = `<div id="quiz-container"><div id="left-bar"><h2 id="quiz-intro">Question ${quizzObj.num}</h2>
    <div id="quiz-type">Multiple Choice</div><div id="player-score">0</div>
    <div id="score-chart"><div id="score-bar"></div></div></div><div id="quiz">
    <div id="timer"><div class="bar"></div></div><h2 id="question">${quizzObj.question}</h2>
    <ul><li><input type="checkbox" name="answer" value="A" id="A" /><label for="A">${quizzObj.options["A"]}</label>
    </li><li><input type="checkbox" name="answer" value="B" id="B" /><label for="B">${quizzObj.options["B"]}</label>
    </li><li><input type="checkbox" name="answer" value="C" id="C" /><label for="C">${quizzObj.options["C"]}</label>
    </li><li><input type="checkbox" name="answer" value="D" id="D" /><label for="D">${quizzObj.options["D"]}</label>
    </li></ul></div><div id="scoreboard"><h2>Scoreboard</h2><div id="sort-container"></div></div></div>`;
    $(".container").html(page);
  }
  countDown(quizzObj.timeLimits);
  sortPlayers(rankResult);
};

function trueFalseOnClick(quizzObj, $element) {
  $element.on("click", ".t-f", async function () {
    $(".t-f").prop("disabled", true);
    const chooseOption = $(this).data("value");
    console.log("chooseoption", chooseOption);
    console.log("typeof chooseoption", typeof chooseOption);
    console.log("quizobj.answer", quizzObj.answer);
    if (chooseOption === quizzObj.answer[0]) {
      $(this).addClass("correct-answer");
      const score = calculateScore(quizzObj.timeLimits, socket.remainTime);
      await axios.post("/api/1.0/score/add", { roomId, score });
      const initvalue = socket.score;
      socket.score += score;
      animateScore($("#player-score"), initvalue, socket.score, 1000);
      changeSideBar(socket.score);
      socket.emit("getAnswer", {
        chooseOption: [chooseOption],
        initvalue,
        score: socket.score,
      });
    } else {
      $(this).addClass("wrong-answer");
      await axios.post("/api/1.0/score/add", {
        roomId,
        score: 100,
      });
      const initvalue = socket.score;
      socket.score += 100;
      animateScore($("#player-score"), initvalue, socket.score, 1000);
      changeSideBar(socket.score);
      socket.emit("getAnswer", {
        chooseOption: [chooseOption],
        initvalue,
        score: socket.score,
      });
    }
  });
}

function multipleChoicesOnclick(quizzObj, $element) {
  $element.on("click", 'input[type="checkbox"]', function () {
    $(this).next().toggleClass("mcs-checked");
  });
  $element.on("click", ".submit-mcs-answer", async function () {
    $("input[type='checkbox']").prop("disabled", true);
    $(this).prop("disabled", true);
    let rightoptions = 0;
    let finalScore = 100;
    $("input[type='checkbox']").each(async function () {
      // FIXME: 這邊的ui要再想想
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
    const score = calculateScore(quizzObj.timeLimits, socket.remainTime);
    if (rightoptions > 0) finalScore = (rightoptions / 4) * 1.2 * score;
    await axios.post("/api/1.0/score/add", { roomId, score: finalScore });
    const initvalue = socket.score;
    socket.score += finalScore;
    animateScore($("#player-score"), initvalue, socket.score, 1000);
    changeSideBar(socket.score);
    const optionArray = [];
    $(".mcs-checked")
      .prev()
      .each(function () {
        optionArray.push($(this).val());
      });
    socket.emit("getAnswer", {
      chooseOption: optionArray,
      initvalue,
      score: socket.score,
    });
  });
}

function multipleChoiceOnclick(quizzObj, $element) {
  $element.on("click", "input[name='answer']", async function () {
    $("input[name='answer']").attr("disabled", true);
    const $selectedInput = $('input[name="answer"]:checked');
    const chooseOption = $('input[name="answer"]:checked').val();
    if ($selectedInput.attr("data-state") === "right") {
      $('input[data-state="right"]').next().addClass("correct-answer");
      const score = calculateScore(quizzObj.timeLimits, socket.remainTime);
      await axios.post("/api/1.0/score/add", { roomId, score });
      const initvalue = socket.score;
      socket.score += score;
      animateScore($("#player-score"), initvalue, socket.score, 1000);
      changeSideBar(socket.score);
      socket.emit("getAnswer", {
        chooseOption: [chooseOption],
        initvalue,
        score: socket.score,
      });
    } else {
      $selectedInput.next().addClass("wrong-answer");
      await axios.post("/api/1.0/score/add", {
        roomId,
        score: 100,
      });
      const initvalue = socket.score;
      socket.score += 100;
      animateScore($("#player-score"), initvalue, socket.score, 1000);
      changeSideBar(socket.score);
      socket.emit("getAnswer", {
        chooseOption: [chooseOption],
        initvalue,
        score: socket.score,
      });
    }
  });
}

function mutipleChoiceCheck(quizzObj, $element) {
  const { answer } = quizzObj;
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
    const percentage = (remainingSeconds / timeLimits) * 100;
    $("#timer .bar").css("width", percentage + "%");
    remainingSeconds -= 0.05;
    socket.remainTime = remainingSeconds;
    if (remainingSeconds < 0) {
      clearInterval(timerId);
      if (socket.host) {
        const lastquiz = socket.lastquizz;
        socket.emit("timeout", lastquiz);
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
  var container = $("#sort-container");
  var items = container.find(".sort-player");

  items.sort(function (a, b) {
    var scoreA = parseInt($(a).find(".sort-player-score").text());
    var scoreB = parseInt($(b).find(".sort-player-score").text());
    return scoreA < scoreB ? 1 : scoreA > scoreB ? -1 : 0;
  });

  items.each(function (index) {
    var currentPosition = $(this).position();
    var newPosition = {
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
