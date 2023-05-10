const userId = localStorage.getItem("userId");
const roomId = localStorage.getItem("dataId");
const isHost = localStorage.getItem("host");

const result = await axios.get(`/api/1.0/game/history?uniqueRoomId=${roomId}`);
const { data } = result.data;
const length = data.history.length;
const gameName = data.name;
const host = data.founder.name;
const date = new Date(data.date);
const timezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
const targetTime = date.getTime() + timezoneOffset + 8 * 60 * 60 * 1000;
const targetDate = new Date(targetTime);
const year = targetDate.getFullYear();
const month = ("0" + (targetDate.getMonth() + 1)).slice(-2);
const day = ("0" + targetDate.getDate()).slice(-2);
const hour = ("0" + targetDate.getHours()).slice(-2);
const minute = ("0" + targetDate.getMinutes()).slice(-2);
const second = ("0" + targetDate.getSeconds()).slice(-2);
const ampm = hour >= 12 ? "pm" : "am";
const time = `${year}-${month}-${day} ${hour % 12}:${minute}:${second}${ampm}`;
const quizArrray = data.quizz;
const rankArray = data.score;
const historyArray = data.history;
$(".game-name").text(`Game name: ${gameName}`);
$(".game-host").text(`Game host: ${host}`);
$(".create-time").text(`Game time: ${time}`);
const canvas = $("#canvas")[0];
const ctx = canvas.getContext("2d");

canvas.width = window.outerWidth;
canvas.height = window.outerWidth;

const stars = [];

function init() {
  for (let i = 0; i < 800; i++) {
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
  // update();
}
init();
animate();
let dropdown = "";
for (let i = 3; i <= +length; i++) {
  dropdown += `<li><a class="dropdown-item" href="#scrollspyHeading${i}">Quiz ${i}</a></li>`;
}
$(".dropdown-menu").html(dropdown);
if (rankArray[1]) {
  $(".player2-name").text(rankArray[1].name);
  $(".player2-score").text(rankArray[1].score);
}
if (rankArray[2]) {
  $(".player3-name").text(rankArray[2].name);
  $(".player3-score").text(rankArray[2].score);
}
$(".player1-name").text(rankArray[0].name);
$(".player1-score").text(rankArray[0].score);
if (!isHost) {
  quizArrray.forEach((quiz, index) => {
    const chooseHistory = historyArray[index][userId]
      ? historyArray[index][userId].join(" ")
      : "";
    if (["MC-EN", "MC-CH", "MCS-EN", "MCS-CH"].includes(quiz.type)) {
      const container = `<div class="quiz-big-container">
      <div class="quiz-container">
      <h4 id="scrollspyHeading${index + 1}">Quiz ${index + 1}</h4>
        <div class="quiz-text" id="quiz-text-${index}"></div>
        <div class="option-container">
          <div class="option" id="A-${index}"></div>
          <div class="option" id="B-${index}"></div>
          <div class="option" id="C-${index}"></div>
          <div class="option" id="D-${index}"></div>
        </div>
        <div class="correct-answer">Answer:  ${quiz.answer.join(" ")}</div>
        <div class="explaination" id="explain-${index}"></div>
        <div class="your-answer">What you choose:   ${chooseHistory}</div>
        
      </div><div class="chart-container">
          <div id="chart-${index + 1}" class="chart-item"></div>
        </div></div>`;
      $(".scrollspy-example").append(container);
      $(`#quiz-text-${index}`).text(quiz.question);
      $(`#A-${index}`).text(`A:  ${quiz.options["A"]}`);
      $(`#B-${index}`).text(`B:  ${quiz.options["B"]}`);
      $(`#C-${index}`).text(`C:  ${quiz.options["C"]}`);
      $(`#D-${index}`).text(`D:  ${quiz.options["D"]}`);
      $(`#explain-${index}`).text(`Explain:   ${quiz.explain}`);
    } else {
      const container = `<div class="quiz-big-container">
      <div class="quiz-container">
      <h4 id="scrollspyHeading${index + 1}">Quiz ${index + 1}</h4>
        <div class="quiz-text" id="quiz-text-${index}"></div>
        <div class="correct-answer">Answer:  ${quiz.answer[0]}</div>
        <div class="explaination" id="explain-${index}"></div>
        <div class="your-answer">What you choose:   ${chooseHistory}</div>
      </div>  <div class="chart-container">
          <div id="chart-${index + 1}" class="chart-item"></div>
        </div></div>`;
      $(".scrollspy-example").append(container);
      $(`#quiz-text-${index}`).text(quiz.question);
      $(`#explain-${index}`).text(`Explain:   ${quiz.explain}`);
    }
  });
} else {
  quizArrray.forEach((quiz, index) => {
    if (["MC-EN", "MC-CH", "MCS-EN", "MCS-CH"].includes(quiz.type)) {
      const container = `<div class="quiz-big-container">
      <div class="quiz-container">
      <h4 id="scrollspyHeading${index + 1}">Quiz ${index + 1}</h4>
        <div class="quiz-text" id="quiz-text-${index}"></div>
        <div class="option-container">
          <div class="option" id="A-${index}"></div>
          <div class="option" id="B-${index}"></div>
          <div class="option" id="C-${index}"></div>
          <div class="option" id="D-${index}"></div>
        </div>
        <div class="correct-answer">Answer:  ${quiz.answer.join(" ")}</div>
        <div class="explaination" id="explain-${index}"></div>
      </div><div class="chart-container">
          <div id="chart-${index + 1}" class="chart-item"></div>
        </div></div>`;
      $(".scrollspy-example").append(container);
      $(`#quiz-text-${index}`).text(quiz.question);
      $(`#A-${index}`).text(`A:  ${quiz.options["A"]}`);
      $(`#B-${index}`).text(`B:  ${quiz.options["B"]}`);
      $(`#C-${index}`).text(`C:  ${quiz.options["C"]}`);
      $(`#D-${index}`).text(`D:  ${quiz.options["D"]}`);
      $(`#explain-${index}`).text(`Explain:   ${quiz.explain}`);
    } else {
      const container = `<div class="quiz-big-container">
      <div class="quiz-container">
      <h4 id="scrollspyHeading${index + 1}">Quiz ${index + 1}</h4>
        <div class="quiz-text" id="quiz-text-${index}"></div>
        <div class="correct-answer">Answer:  ${quiz.answer[0]}</div>
        <div class="explaination" id="explain-${index}"></div>
      </div>  <div class="chart-container">
          <div id="chart-${index + 1}" class="chart-item"></div>
        </div></div>`;
      $(".scrollspy-example").append(container);
      $(`#quiz-text-${index}`).text(quiz.question);
      $(`#explain-${index}`).text(`Explain:   ${quiz.explain}`);
    }
  });
}

historyArray.forEach((data, index) => {
  generateChart(index);
});

$(window).on("beforeunload", () => {
  localStorage.removeItem("host");
  localStorage.removeItem("dataId");
});
function generateChart(index) {
  const dataArray = historyArray[index];
  const charArray = countOptions(dataArray);
  Highcharts.chart(`chart-${index + 1}`, {
    chart: {
      type: "column",
      width: 400,
      backgroundColor: "transparent",
    },
    credits: {
      enabled: false,
    },
    exporting: {
      enabled: false,
    },
    legend: {
      enabled: false,
    },
    title: {
      text: "Answer Analysis",
      style: {
        color: "white",
        fontSize: "32px",
      },
    },
    xAxis: {
      categories: Object.keys(charArray),
      crosshair: true,
      title: {
        text: "Options",
        margin: 20,
        style: {
          color: "white",
          fontSize: "20px",
        },
      },
    },
    yAxis: {
      tickInterval: 1,
      min: 0,
      title: {
        text: "Number of people choosed",
        margin: 40,
        style: {
          color: "white",
          fontSize: "20px",
        },
      },
    },
    tooltip: {
      pointFormat: "<b>{point.y} people</b>",
      style: {
        fontSize: "18px",
        color: "#0E1A3C",
      },
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      borderWidth: 0,
    },

    plotOptions: {
      column: {
        pointWidth: 60,
      },
      series: {
        depth: 25,
      },
    },
    series: [
      {
        data: Object.values(charArray),
        colorByPoint: true,
        showInLegend: false,
      },
    ],
  });
}

function countOptions(data) {
  const result = {};
  for (const userId in data) {
    const options = data[userId];
    for (const option of options) {
      if (result[option]) {
        result[option]++;
      } else {
        result[option] = 1;
      }
    }
  }
  return result;
}
