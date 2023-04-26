const userId = localStorage.getItem("userId");
const roomId = localStorage.getItem("dataId");
const isHost = localStorage.getItem("host");

const result = await axios.get(`/api/1.0/game/history?uniqueRoomId=${roomId}`);
const { data } = result.data;
const length = data.history.length;
const gameName = data.name;
const host = data.founder.name;
const time = data.date;
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
let container = "";
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
    if (["MC-EN", "MC-CH", "MCS-EN", "MCS-CH"].includes(quiz.type)) {
      container += `<div class="quiz-big-container">
      <div class="quiz-container">
      <h4 id="scrollspyHeading${index + 1}">Quiz ${index + 1}</h4>
        <div class="quiz-text">${quiz.question}</div>
        <div class="option-container">
          <div class="option">A:  ${quiz.options["A"]}</div>
          <div class="option">B:  ${quiz.options["B"]}</div>
          <div class="option">C:  ${quiz.options["C"]}</div>
          <div class="option">D:  ${quiz.options["D"]}</div>
        </div>
        <div class="correct-answer">Answer:  ${quiz.answer.join(" ")}</div>
        <div class="explaination">Explain:   ${quiz.explain}</div>
        <div class="your-answer">What you choose:   ${historyArray[index][
          userId
        ].join(" ")}</div>
        
      </div><div class="chart-container">
          <div id="chart-${index + 1}" class="chart-item"></div>
        </div></div>`;
    } else {
      container += `<div class="quiz-big-container">
      <div class="quiz-container">
      <h4 id="scrollspyHeading${index + 1}">Quiz ${index + 1}</h4>
        <div class="quiz-text">${quiz.question}</div>
        <div class="correct-answer">Answer:  ${quiz.answer[0]}</div>
        <div class="explaination">Explain:   ${quiz.explain}</div>
        <div class="your-answer">What you choose:   ${historyArray[index][
          userId
        ].join(" ")}</div>
      
      </div>  <div class="chart-container">
          <div id="chart-${index + 1}" class="chart-item"></div>
        </div></div>`;
    }
  });
} else {
  quizArrray.forEach((quiz, index) => {
    if (["MC-EN", "MC-CH", "MCS-EN", "MCS-CH"].includes(quiz.type)) {
      container += `<div class="quiz-big-container">
      <div class="quiz-container">
      <h4 id="scrollspyHeading${index + 1}">Quiz ${index + 1}</h4>
        <div class="quiz-text">${quiz.question}</div>
        <div class="option-container">
          <div class="option">A:  ${quiz.options["A"]}</div>
          <div class="option">B:  ${quiz.options["B"]}</div>
          <div class="option">C:  ${quiz.options["C"]}</div>
          <div class="option">D:  ${quiz.options["D"]}</div>
        </div>
        <div class="correct-answer">Answer:  ${quiz.answer.join(" ")}</div>
        <div class="explaination">Explain:   ${quiz.explain}</div>
      </div><div class="chart-container">
          <div id="chart-${index + 1}" class="chart-item"></div>
        </div></div>`;
    } else {
      container += `<div class="quiz-big-container">
      <div class="quiz-container">
      <h4 id="scrollspyHeading${index + 1}">Quiz ${index + 1}</h4>
        <div class="quiz-text">${quiz.question}</div>
        <div class="correct-answer">Answer:  ${quiz.answer[0]}</div>
        <div class="explaination">Explain:   ${quiz.explain}</div>
      </div>  <div class="chart-container">
          <div id="chart-${index + 1}" class="chart-item"></div>
        </div></div>`;
    }
  });
}

$(".scrollspy-example").html(container);

historyArray.forEach((data, index) => {
  generateChart(index);
});

function generateChart(index) {
  const dataArray = historyArray[index];
  const charArray = countOptions(dataArray);
  // Highcharts.chart(`chart-${index + 1}`, {
  //   chart: {
  //     type: "column",
  //     width: 400,
  //     styledMode: true,
  //     options3d: {
  //       enabled: true,
  //       alpha: 15,
  //       beta: 15,
  //       depth: 30,
  //     },
  //     backgroundColor: "transparent",
  //   },

  //   credits: {
  //     enabled: false,
  //   },
  //   exporting: {
  //     enabled: false,
  //   },
  //   legend: {
  //     enabled: false,
  //   },
  //   title: {
  //     text: "Answer Analysis",
  //   },
  //   plotOptions: {
  //     column: {
  //       depth: 15,
  //       pointWidth: 30,
  //     },
  //   },
  //   xAxis: {
  //     categories: Object.keys(charArray),
  //     title: {
  //       text: "Options",
  //       margin: 20,
  //     },
  //   },
  //   yAxis: {
  //     tickInterval: 1,
  //     title: {
  //       text: "Number of people choosed",
  //       margin: 40,
  //     },
  //   },
  //   series: [
  //     {
  //       data: Object.values(charArray),
  //       colorByPoint: true,
  //       showInLegend: false,
  //     },
  //   ],
  // });
  Highcharts.chart(`chart-${index + 1}`, {
    chart: {
      type: "column",
      width: 400,
      backgroundColor: "red",
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
    },
    plotOptions: {
      column: {
        depth: 15,
        pointWidth: 30,
      },
    },

    xAxis: {
      categories: Object.keys(charArray),
      crosshair: true,
      title: {
        text: "Options",
        margin: 20,
      },
    },
    yAxis: {
      tickInterval: 1,
      min: 0,
      title: {
        text: "Number of people choosed",
        margin: 40,
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
