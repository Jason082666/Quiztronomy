const userId = localStorage.getItem("userId");
const result = await axios.get(
  `/api/1.0/player/history?userId=${userId}&paging=0`
);
const totalGameAndScore = await axios.get(
  `/api/1.0/user/history?userId=${userId}`
);
const data = result.data;
const dataArray = data.data;
const barChartDataArray = dataArray.map((data, index) => {
  const date = new Date(data.date);
  const taiwanDate = new Date(date.getTime());
  const time = taiwanDate.toLocaleString();
  return { x: index, y: +data.score, date: time };
});

const { game, score } = totalGameAndScore.data.data;
$(".game-times").html(`You've played ${game} games.`);
$(".score-totals").html(`You've earned  ${score}  scores.`);

const renderQuiz = (data) => {
  let historyDatahtml = "";
  const dataArray = data.data;
  dataArray.forEach((data) => {
    const date = new Date(data.date);
    const taiwanDate = new Date(date.getTime());
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
  });
  $(".quiz-container").html(historyDatahtml);
  renderPagingButton(data.next, "player");
};

const renderHostQuiz = (data) => {
  const dataArray = data.data;
  let historyDataHosthtml = "";
  dataArray.forEach((data) => {
    const date = new Date(data.date);
    const taiwanDate = new Date(date.getTime() + 8 * 60 * 60 * 1000);
    historyDataHosthtml += `<div class="col">
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
  });
  $(".quiz-container").html(historyDataHosthtml);
  renderPagingButton(data.next, "host");
};

const renderPagingButton = (next = null, character) => {
  if (!next) {
    const $button =
      $(`<button type="button" class="btn btn-secondary back-to-first-${character}">
            Back to first page
        </button>`);
    $("#control-paging-btn-container").append($button);
  } else {
    let nextPage;
    if (+next < 2) {
      nextPage = 0;
    } else {
      nextPage = +next - 2;
    }
    const $button =
      $(`<button type="button" class="btn btn-secondary back-to-first-${character}">
            Back to first page
        </button>
        <button type="button" class="btn btn-secondary prev-page-btn-${character}" data-id="${nextPage}"> Previous page
        </button>
        <button type="button" class="btn btn-secondary next-page-btn-${character}" data-id="${next}">
            Next page
        </button>`);
    $("#control-paging-btn-container").append($button);
  }
};
renderQuiz(data);

$("#control-paging-btn-container").on(
  "click",
  ".next-page-btn-host",
  async function () {
    const page = $(this).attr("data-id");
    console.log(page);
    $(".quiz-container").empty();
    $("#control-paging-btn-container").empty();
    const result = await axios.get(
      `/api/1.0/host/history?userId=${userId}&paging=${page}`
    );
    renderHostQuiz(result.data, "host");
  }
);

$("#control-paging-btn-container").on(
  "click",
  ".next-page-btn-player",
  async function () {
    const page = $(this).attr("data-id");
    console.log(page);
    $(".quiz-container").empty();
    $("#control-paging-btn-container").empty();
    const result = await axios.get(
      `/api/1.0/player/history?userId=${userId}&paging=${page}`
    );
    renderQuiz(result.data, "player");
  }
);

$("#control-paging-btn-container").on(
  "click",
  `.prev-page-btn-player`,
  async function () {
    const page = $(this).attr("data-id");
    console.log(page);
    $(".quiz-container").empty();
    $("#control-paging-btn-container").empty();
    const result = await axios.get(
      `/api/1.0/player/history?userId=${userId}&paging=${page}`
    );
    renderQuiz(result.data, "player");
  }
);

$("#control-paging-btn-container").on(
  "click",
  ".prev-page-btn-host",
  async function () {
    const page = $(this).attr("data-id");
    console.log(page);
    $(".quiz-container").empty();
    $("#control-paging-btn-container").empty();
    const result = await axios.get(
      `/api/1.0/host/history?userId=${userId}&paging=${page}`
    );
    renderHostQuiz(result.data, "host");
  }
);

$("#control-paging-btn-container").on(
  "click",
  ".back-to-first-player",
  async () => {
    console.log(123);
    $(".quiz-container").empty();
    $("#control-paging-btn-container").empty();
    const result = await axios.get(
      `/api/1.0/player/history?userId=${userId}&paging=0`
    );
    renderQuiz(result.data, "player");
  }
);

$("#control-paging-btn-container").on(
  "click",
  ".back-to-first-host",
  async () => {
    console.log(456);
    $(".quiz-container").empty();
    $("#control-paging-btn-container").empty();
    const result = await axios.get(
      `/api/1.0/host/history?userId=${userId}&paging=0`
    );
    renderHostQuiz(result.data, "host");
  }
);

$(".host-history-btn").on("click", async () => {
  $(".quiz-container").empty();
  $("#control-paging-btn-container").empty();
  const result = await axios.get(
    `/api/1.0/host/history?userId=${userId}&paging=0`
  );
  renderHostQuiz(result.data, "host");
});

$(".player-history-btn").on("click", async () => {
  $(".quiz-container").empty();
  $("#control-paging-btn-container").empty();
  const result = await axios.get(
    `/api/1.0/player/history?userId=${userId}&paging=0`
  );
  renderQuiz(result.data, "player");
});
const rankObject = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, other: 0 };
data.data.forEach((data) => {
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

Highcharts.chart("bar-char", {
  chart: {
    type: "cylinder",
    options3d: {
      enabled: true,
      alpha: 15,
      beta: 15,
      depth: 50,
      viewDistance: 25,
    },
  },
  title: {
    text: "Last six games performance",
  },
  xAxis: {
    categories: ["1", "2", "3", "4", "5", "6"],
    title: {
      text: "",
    },
  },
  yAxis: {
    title: {
      margin: 20,
      text: "Scores",
    },
  },
  tooltip: {
    headerFormat: "<b>Game {point.x}</b><br>",
    pointFormat: "Date: {point.date}<br>Scores: {point.y}",
  },
  plotOptions: {
    series: {
      depth: 25,
      colorByPoint: true,
    },
  },
  series: [
    {
      data: barChartDataArray,
      name: "Cases",
      showInLegend: false,
    },
  ],
});
