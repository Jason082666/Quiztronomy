const userId = localStorage.getItem("userId");
const result = await axios.get(
  `/api/1.0/player/history?userId=${userId}&paging=0`
);
const totalGameAndScore = await axios.get(
  `/api/1.0/user/history?userId=${userId}`
);
const data = result.data;
const dataArray = data.data;
let barChartDataArray;
if (dataArray !== "no data") {
  barChartDataArray = dataArray.map((data, index) => {
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
    const time = `${year}-${month}-${day} ${
      hour % 12
    }:${minute}:${second}${ampm}`;
    return { x: index, y: +data.score, date: time };
  });
} else {
  const text = $(
    "<div class='suggesting-text'>Play your very first game now !</div>"
  );
  $("section").after(text);
}

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
const { game, score } = totalGameAndScore.data.data;
$(".game-times").html(`You've played ${game} games.`);
$(".score-totals").html(`You've earned  ${score}  scores.`);
$(".player-history-btn").css("border", "5px solid white");
const renderQuiz = (data) => {
  let historyDatahtml = "";
  const dataArray = data.data;
  if (dataArray == "no data") return;
  dataArray.forEach((data) => {
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
    const formattedDate = `${year}-${month}-${day} ${
      hour % 12
    }:${minute}:${second}${ampm}`;
    historyDatahtml = `<div class="col">
    <div class="card shadow-sm">
        <svg
      class="bd-placeholder-img card-img-top"
      width="100%"
      height="225"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      preserveAspectRatio="xMidYMid slice"
      focusable="false"
    >
      <title>Placeholder</title>
      <rect width="100%" height="100%" fill="transparent"></rect>
      <foreignObject x="0" y="0" width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" id="${data.roomId}-info" class="quiz-card">
        </div></foreignObject
      >
    </svg>
      <div class="card-body">
        <p class="card-text">
        <div>Game host: ${data.host}</div>
          <div>Your rank: ${data.rank}</div>
          <div>Your score: ${data.score}</div>
        </p>
        <div class="d-flex justify-content-between align-items-center">
          <div class="btn-group">
            <button type="button" class="btn btn-sm btn-outline-secondary view-player" data-id="${data.roomId}">
              View
            </button>
          </div>
          <small class="text-muted">${formattedDate}</small>
        </div>
      </div>
    </div>
  </div>`;
    $(".quiz-container").append(historyDatahtml);
    $(`#${data.roomId}-info`).text(data.roomName);
  });

  renderPagingButton(data.next, "player");
};

const renderHostQuiz = (data) => {
  const dataArray = data.data;
  if (dataArray == "no data") return;
  let historyDataHosthtml = "";
  dataArray.forEach((data) => {
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
    const formattedDate = `${year}-${month}-${day} ${
      hour % 12
    }:${minute}:${second}${ampm}`;

    historyDataHosthtml = `<div class="col">
  <div class="card shadow-sm">
    <svg
      class="bd-placeholder-img card-img-top"
      width="100%"
      height="225"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      preserveAspectRatio="xMidYMid slice"
      focusable="false"
    >
      <title>Placeholder</title>
      <rect width="100%" height="100%" fill="transparent"></rect>
      <foreignObject x="0" y="0" width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" id="${data.roomId}-info" class="quiz-card">
        </div></foreignObject
      >
    </svg>
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center">
        <div class="btn-group">
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary view-host"
            data-id="${data.roomId}"
          >
            View
          </button>
        </div>
        <small class="text-muted">${formattedDate}</small>
      </div>
    </div>
  </div>
</div>
`;
    $(".quiz-container").append(historyDataHosthtml);
    $(`#${data.roomId}-info`).text(data.roomName);
  });

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
      $(`<div class="btn-bottom-group"><button type="button" class="btn back-to-first-${character}">
          First page
        </button>
        <button type="button" class="btn prev-page-btn-${character}" data-id="${nextPage}"> Previous page
        </button>
        <button type="button" class="btn  next-page-btn-${character}" data-id="${next}">
            Next page
        </button></div>`);
    $("#control-paging-btn-container").append($button);
  }
};
renderQuiz(data);

$("#control-paging-btn-container").on(
  "click",
  ".next-page-btn-host",
  async function () {
    const page = $(this).attr("data-id");
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
    $(".quiz-container").empty();
    $("#control-paging-btn-container").empty();
    const result = await axios.get(
      `/api/1.0/host/history?userId=${userId}&paging=0`
    );
    renderHostQuiz(result.data, "host");
  }
);

$(".host-history-btn").on("click", async () => {
  $(".player-history-btn").css("border", "none");
  $(".host-history-btn").css("border", "5px solid white");
  $(".quiz-container").empty();
  $("#control-paging-btn-container").empty();
  const result = await axios.get(
    `/api/1.0/host/history?userId=${userId}&paging=0`
  );
  renderHostQuiz(result.data, "host");
});

$(".player-history-btn").on("click", async () => {
  $(".player-history-btn").css("border", "5px solid white");
  $(".host-history-btn").css("border", "none");
  $(".quiz-container").empty();
  $("#control-paging-btn-container").empty();
  const result = await axios.get(
    `/api/1.0/player/history?userId=${userId}&paging=0`
  );
  renderQuiz(result.data, "player");
});
const rankObject = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, other: 0 };
if (data.data !== "no data") {
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
}

Highcharts.chart("pie-char", {
  chart: {
    type: "variablepie",
    backgroundColor: "transparent",
  },
  exporting: {
    enabled: false,
  },
  credits: {
    enabled: false,
  },
  title: {
    text: "Last six rank records",
    align: "center",
    style: {
      fontSize: "24px",
      color: "white",
    },
  },
  tooltip: {
    headerFormat: "",
    style: {
      fontSize: "18px",
    },
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
          dataLabels: {
            style: {
              fontSize: "18px",
              color: "#0E1A3C",
            },
          },
          color: "#204e77",
        },
        {
          name: "Rank 2",
          y: rankObject[2],
          z: 165,
          dataLabels: {
            style: {
              fontSize: "18px",
              color: "#0E1A3C",
            },
          },
          color: "#5362E2",
        },
        {
          name: "Rank 3",
          y: rankObject[3],
          z: 130,
          dataLabels: {
            style: {
              fontSize: "18px",
              color: "#0E1A3C",
            },
          },
          color: "#5398E2",
        },
        {
          name: "Rank 4",
          y: rankObject[4],
          z: 116,
          dataLabels: {
            style: {
              fontSize: "18px",
              color: "#0E1A3C",
            },
          },
          color: "#A6DBCC",
        },
        {
          name: "Rank 5 ",
          y: rankObject[5],
          z: 90,
          dataLabels: {
            style: {
              fontSize: "18px",
              color: "#0E1A3C",
            },
          },
        },
        {
          name: "Others",
          y: rankObject["other"],
          z: 80,
          dataLabels: {
            style: {
              fontSize: "18px",
              color: "#0E1A3C",
            },
          },
          color: "#34BABD",
        },
      ],
    },
  ],
});

// Highcharts.chart("bar-char", {
//   chart: {
//     type: "cylinder",
//     options3d: {
//       enabled: true,
//       alpha: 15,
//       beta: 15,
//       depth: 50,
//       viewDistance: 25,
//     },
//     backgroundColor: "transparent",
//   },
//   credits: {
//     enabled: false,
//   },
//   exporting: {
//     enabled: false,
//   },
//   title: {
//     text: "Last six games performance",
//     style: {
//       fontSize: "24px",
//       color: "white",
//     },
//   },
//   xAxis: {
//     categories: ["1", "2", "3", "4", "5", "6"],
//     title: {
//       text: "",
//     },
//     labels: {
//       style: {
//         fontSize: "18px",
//         color: "white",
//       },
//     },
//   },
//   yAxis: {
//     title: {
//       margin: 20,
//       text: "Scores",
//       style: {
//         fontSize: "24px",
//         color: "white",
//       },
//     },
//     labels: {
//       style: {
//         fontSize: "18px",
//         color: "white",
//       },
//     },
//   },
//   tooltip: {
//     headerFormat: "<b>Game {point.x}</b><br>",
//     style: {
//       fontSize: "18px",
//       color: "#0E1A3C",
//     },
//     pointFormat: "Date: {point.date}<br>Scores: {point.y}",
//   },
//   plotOptions: {
//     series: {
//       depth: 25,
//       colorByPoint: true,
//     },
//   },
//   series: [
//     {
//       data: barChartDataArray,
//       name: "Cases",
//       showInLegend: false,
//     },
//   ],
// });

Highcharts.chart("bar-char", {
  chart: {
    type: "column",
    backgroundColor: "transparent",
  },
  credits: {
    enabled: false,
  },
  exporting: {
    enabled: false,
  },
  title: {
    text: "Last six games performance",
    style: {
      fontSize: "24px",
      color: "white",
    },
  },
  xAxis: {
    categories: ["1", "2", "3", "4", "5", "6"],
    crosshair: true,
    labels: {
      style: {
        fontSize: "18px",
        color: "white",
      },
    },
  },
  yAxis: {
    min: 0,
    title: {
      margin: 20,
      text: "",
      style: {
        fontSize: "24px",
        color: "white",
      },
    },
    labels: {
      style: {
        color: "white",
        fontSize: "16px",
      },
    },
  },
  tooltip: {
    headerFormat: "<b>Game {point.x}</b><br>",
    style: {
      fontSize: "18px",
      color: "#0E1A3C",
    },
    pointFormat: "Date: {point.date}<br>Scores: {point.y}",
  },
  colors: ["#34BABD", "#A6DBCC", "#5398E2", "#5362E2", "#204E77", "#425189"],
  plotOptions: {
    column: {
      pointWidth: 80,
      colorByPoint: true,
    },
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

$(".container").on("click", ".view-player", function () {
  localStorage.setItem("dataId", $(this).attr("data-id"));
  window.location.href = "/game/quiz-detail.html";
});
$(".highcharts-background ");
$(".container").on("click", ".view-host", function () {
  localStorage.setItem("dataId", $(this).attr("data-id"));
  localStorage.setItem("host", true);
  window.location.href = "/game/quiz-detail.html";
});

$(".logout-btn").on("click", async (e) => {
  e.preventDefault();
  localStorage.clear();
  await axios.post("/api/1.0/user/logout");
  window.location.href = "/";
});
