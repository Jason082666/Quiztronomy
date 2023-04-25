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
let dropdown = "";
let container = "";
let rank = "";
for (let i = 3; i <= +length; i++) {
  dropdown += `<li><a class="dropdown-item" href="#scrollspyHeading${i}">Quiz ${i}</a></li>`;
}
$(".dropdown-menu").html(dropdown);

rankArray.forEach((ranking, index) => {
  rank += `<div class="rank-item">No. ${index + 1}:  ${ranking.name}  -score: ${
    ranking.score
  }</div>`;
});
$(".rank-container").html(rank);
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
  Highcharts.chart(`chart-${index + 1}`, {
    chart: {
      type: "column",
      styledMode: true,
      options3d: {
        enabled: true,
        alpha: 15,
        beta: 15,
        depth: 30,
      },
    },
    title: {
      text: "Answer",
    },
    plotOptions: {
      column: {
        depth: 15,
      },
    },
    xAxis: {
      categories: Object.keys(charArray),
    },
    series: [
      {
        data: Object.values(charArray),
        colorByPoint: true,
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
