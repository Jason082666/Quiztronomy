const userId = localStorage.getItem("userId");
const result = await axios.get(`/api/1.0/user/history?userId=${userId}`);
const dataArray = result.data.data;
console.log(dataArray);
let score = 0;
let historyDatahtml = "";
let historyDataHosthtml = "";
dataArray.forEach((data) => {
  if (data.score !== "null") {
    score += +data.score;
    const date = new Date(data.date);
    const taiwanDate = new Date(date.getTime() + 8 * 60 * 60 * 1000);
    historyDatahtml += `<div class="col">
    <div class="card shadow-sm">
      <svg
        class="bd-placeholder-img card-img-top"
        width="100%"
        height="225"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Placeholder: ${data.roomName}"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <title>Placeholder</title>
        <rect width="100%" height="100%" fill="#55595c" />
        <text x="50%" y="50%" fill="#eceeef" dy=".3em">
          ${data.roomName}
        </text>
      </svg>
      <div class="card-body">
        <p class="card-text">
        <div>Game host: ${data.host}</div>
          <div>Your rank: ${data.rank}</div>
          <div>Your score: ${data.score}</div>
        </p>
        <div class="d-flex justify-content-between align-items-center">
          <div class="btn-group">
            <button type="button" class="btn btn-sm btn-outline-secondary">
              View
            </button>
          </div>
          <small class="text-muted">${taiwanDate.toLocaleString()}</small>
        </div>
      </div>
    </div>
  </div>`;
  } else {
    const date = new Date(data.date);
    const taiwanDate = new Date(date.getTime() + 8 * 60 * 60 * 1000);
    historyDatahtml += `<div class="col">
    <div class="card shadow-sm">
      <svg
        class="bd-placeholder-img card-img-top"
        width="100%"
        height="225"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Placeholder: ${data.roomName}"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <title>Placeholder</title>
        <rect width="100%" height="100%" fill="#55595c" />
        <text x="50%" y="50%" fill="#eceeef" dy=".3em">
          ${data.roomName}
        </text>
      </svg>
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <div class="btn-group">
            <button type="button" class="btn btn-sm btn-outline-secondary">
              View
            </button>
          </div>
          <small class="text-muted">${taiwanDate.toLocaleString()}</small>
        </div>
      </div>
    </div>
  </div>`;
  }
});
$(".quiz-container").html(historyDatahtml);
$(".game-times").html(`You've played ${dataArray.length} games.`);
$(".score-totals").html(`You've earned  ${score}  scores.`);

const rankObject = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, other: 0 };
dataArray.forEach((data) => {
  if (data.rank == 1) {
    rankObject["1"] += 1;
  } else if (data.rank == 2) {
    rankObject["2"] += 1;
  } else if (data.rank == 3) {
    rankObject["3"] += 1;
  } else if (data.rank == 4) {
    rankObject["4"] += 1;
  } else if (data.rank == 5) {
    rankObject["5"] += 1;
  } else {
    rankObject["other"] += 1;
  }
});

Highcharts.chart("pie-char", {
  chart: {
    type: "variablepie",
  },
  title: {
    text: "Your rank records",
    align: "center",
  },
  tooltip: {
    headerFormat: "",
    pointFormat:
      '<span style="color:{point.color}">\u25CF</span> <b> {point.name}</b><br/>' +
      "Times: <b>{point.y}</b><br/>",
  },
  series: [
    {
      minPointSize: 10,
      innerSize: "30%",
      zMin: 0,
      name: "countries",
      data: [
        {
          name: "Rank 1 ",
          y: rankObject[1],
          z: 192,
        },
        {
          name: "Rank 2",
          y: rankObject[2],
          z: 165,
        },
        {
          name: "Rank 3",
          y: rankObject[3],
          z: 130,
        },
        {
          name: "Rank 4",
          y: rankObject[4],
          z: 116,
        },
        {
          name: "Rank 5 ",
          y: rankObject[5],
          z: 90,
        },
        {
          name: "Others",
          y: rankObject["other"],
          z: 80,
        },
      ],
    },
  ],
});
