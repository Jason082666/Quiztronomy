const userStatus = await axios.get("/api/1.0/user/status");
const { data } = userStatus.data;
console.log(data);
if (data.error) {
  localStorage.clear();
}
localStorage.removeItem("searchedId");
localStorage.removeItem("quizzes");
localStorage.removeItem("roomId");
const userId = localStorage.getItem("userId");
const userName = localStorage.getItem("userName");
if (userName && userId) {
  $("canvas").hide();
  $(".enter-container").hide();
  $(".signup-login").hide();
  $(".container").html(` <h1>Welcome back ${userName} ! </h1>
  <div class="button-container">
    <label class="label-for-roomId" for="roomId">Enter a Room ID:</label>
    <input class="input-for-roomId" type="text" id="roomId">
    <button id="join">Join Room</button>
    <button id="create">Create Room</button>
  </div>`);
} else {
  $(".logout-btn").hide();
  let w, h;
  const canvas = $("#canvas")[0];
  const ctx = canvas.getContext("2d");
  const { sin, cos, PI, hypot, min, max } = Math;

  function spawn() {
    const pts = many(333, () => {
      return {
        x: rnd(window.innerWidth),
        y: rnd(window.innerHeight),
        len: 0,
        r: 0,
      };
    });

    const pts2 = many(9, (i) => {
      return {
        x: cos((i / 9) * PI * 2),
        y: sin((i / 9) * PI * 2),
      };
    });

    let seed = rnd(100);
    let tx = rnd(window.innerWidth);
    let ty = rnd(window.innerHeight);
    let x = rnd(window.innerWidth);
    let y = rnd(window.innerHeight);
    let kx = rnd(0.5, 0.5);
    let ky = rnd(0.5, 0.5);
    let walkRadius = pt(rnd(50, 50), rnd(50, 50));
    let r = window.innerWidth / rnd(100, 150);

    function paintPt(pt) {
      pts2.forEach((pt2) => {
        if (!pt.len) return;
        drawLine(
          lerp(x + pt2.x * r, pt.x, pt.len * pt.len),
          lerp(y + pt2.y * r, pt.y, pt.len * pt.len),
          x + pt2.x * r,
          y + pt2.y * r
        );
      });
      ctx.fillStyle = "#E5F6EB";
      drawCircle(pt.x, pt.y, pt.r);
    }

    return {
      follow(x, y) {
        tx = x;
        ty = y;
      },

      tick(t) {
        const selfMoveX = cos(t * kx + seed) * walkRadius.x;
        const selfMoveY = sin(t * ky + seed) * walkRadius.y;
        let fx = tx + selfMoveX;
        let fy = ty + selfMoveY;

        x += min(window.innerWidth / 100, (fx - x) / 10);
        y += min(window.innerWidth / 100, (fy - y) / 10);

        let i = 0;
        pts.forEach((pt) => {
          const dx = pt.x - x,
            dy = pt.y - y;
          const len = hypot(dx, dy);
          let r = min(2, window.innerWidth / len / 5);
          pt.t = 0;
          const increasing = len < window.innerWidth / 10 && i++ < 8;
          let dir = increasing ? 0.1 : -0.1;
          if (increasing) {
            r *= 1.5;
          }
          pt.r = r;
          pt.len = max(0, min(pt.len + dir, 1));
          paintPt(pt);
        });
      },
    };
  }

  const spiders = many(2, spawn);

  $(window).on("pointermove", (e) => {
    spiders.forEach((spider) => {
      spider.follow(e.clientX + 200, e.clientY + 200);
    });
  });

  requestAnimationFrame(function anim(t) {
    if (w !== window.innerWidth) w = canvas.width = window.innerWidth;
    if (h !== window.innerHeight) h = canvas.height = window.innerHeight;
    ctx.fillStyle = "rgba(14, 26, 60, 0.3)";
    // ctx.fillStyle = "#081625";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawCircle(0, 0, w * 10);
    ctx.fillStyle = ctx.strokeStyle = "#fff";
    t /= 1000;
    spiders.forEach((spider) => {
      spider.tick(t);
    });
    requestAnimationFrame(anim);
  });

  function drawCircle(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * PI);
    ctx.fill();
  }

  function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function pt(x, y) {
    return { x, y };
  }

  function rnd(min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }
    return min + Math.random() * (max - min);
  }

  function many(n, f) {
    const res = new Array(n);
    for (let i = 0; i < n; i++) {
      res[i] = f(i);
    }
    return res;
  }
}

$(".signup-login").on("click", () => {
  $(".container").hide();
  $(".sign-component").show();
  $(".signup-login").hide();
  $(".back-to-main").show();
});

$(".back-to-main").on("click", () => {
  $(".container").show();
  $(".sign-component").hide();
  $(".signup-login").show();
  $(".back-to-main").hide();
});

$(".logout-btn").on("click", async (e) => {
  e.preventDefault();
  localStorage.clear();
  await axios.post("/api/1.0/user/logout");
  window.location.href = "/";
});

$(".home-page").on("click", () => {
  window.location.href = "/";
});

$(".log-in-btn").on("click", async function (e) {
  e.preventDefault();
  const email = $("#email").val();
  const password = $("#password").val();
  const userdata = { email, password };
  const result = await axios.post("/api/1.0/user/login", userdata);
  if (result.error) return;
  const userName = result.data.data.name;
  const userId = result.data.data._id;
  localStorage.setItem("userName", userName);
  localStorage.setItem("userId", userId);
  $("canvas").hide();
  $(".enter-container").hide();
  $(".sign-component").hide();
  $(".logout-btn").show();
  $(".back-to-main").hide();
  $(".container").html(`<h1>Welcome back ${userName} ! </h1>
  <div class="button-container">
    <label class="label-for-roomId" for="roomId">Enter a Room ID:</label>
    <input class="input-for-roomId" type="text" id="roomId">
    <button id="join">Join Room</button>
    <button id="create">Create Room</button>
  </div>`);
});

$(".sign-up-btn").on("click", async function (e) {
  e.preventDefault();
  const name = $("#name").val();
  const email = $("#email").val();
  const password = $("#password").val();
  const userdata = { name, email, password };
  const result = await axios.post("/api/1.0/user/signup", userdata);
  if (result.error) return;
  const userName = result.data.data.name;
  const userId = result.data.data._id;
  localStorage.setItem("userName", userName);
  localStorage.setItem("userId", userId);
  $("canvas").hide();
  $(".enter-container").hide();
  $(".sign-component").hide();
  $(".logout-btn").show();
  $(".back-to-main").hide();
  $(".container").html(`<h1>Welcome back ${userName} ! </h1>
  <div class="button-container">
    <label class="label-for-roomId" for="roomId">Enter a Room ID:</label>
    <input class="input-for-roomId" type="text" id="roomId">
    <button id="join">Join Room</button>
    <button id="create">Create Room</button>
  </div>`);
});

$(".sign-up").on("click", function () {
  $(".move-component").animate(
    {
      left: "40px",
    },
    500
  );
  $("#move-component-login").hide();
  $("#move-component-signup").show();
});

$(".log-in").on("click", function () {
  $(".move-component").animate(
    {
      left: "350px",
    },
    500
  );
  $("#move-component-signup").hide();
  $("#move-component-login").show();
});

$(".container").on("click", "#create", async (e) => {
  e.preventDefault();
  window.location.href = "/game/createroom.html";
});

$(".container").on("click", "#join", async (e) => {
  e.preventDefault();
  const roomId = $("#roomId").val();
  const enterResult = await axios.post("/api/1.0/game/enter", { roomId });
  const { data } = enterResult.data;
  localStorage.setItem("userName", data.userName);
  localStorage.setItem("userId", data.userId);
  localStorage.setItem("roomId", roomId);
  window.location.href = `/game/room/${roomId}`;
});

$(".enter-btn").on("click", async () => {
  const roomId = $("#room-name").val();
  const name = $("#user-name").val();
  const result = await axios.post("/api/1.0/visitor/login", { name });
  if (result.error) return;
  const enterResult = await axios.post("/api/1.0/game/enter", { roomId });
  const { data } = enterResult.data;
  localStorage.setItem("userName", data.userName);
  localStorage.setItem("userId", data.userId);
  localStorage.setItem("roomId", roomId);
  window.location.href = `/game/room/${roomId}`;
});
