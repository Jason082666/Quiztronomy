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
  ctx.fillStyle = "#000";
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

$(".login-btn").on("click", () => {
  $(".login-container").hide();
  $(".signin-container").hide();
  $(".container").html(
    `<div class="login-container">
      <form>
        <label for="email">Email:</label>
        <input class="email-input" type="text" id="email" name="email" />
        <label for="password">Password:</label>
        <input
          class="passowrd-input"
          type="password"
          id="password"
          name="password"
        />
        <button class="login" type="submit">Log in</button>
      </form>
    </div>`
  );
});

$(".signin-btn").on("click", () => {
  $(".enter-container").hide();
  $(".login-container").hide();
  $(".container").html(
    `<div class="signin-container">
  <form>
    <label for="name">Name:</label>
    <input class="name-input" type="text" id="name" name="name" />
    <label for="email">Email:</label>
    <input class="email-input" type="text" id="email" name="email" />
    <label for="password">Password:</label>
    <input
      class="passowrd-input"
      type="password"
      id="password"
      name="password"
    />
    <button class="signin" type="submit">
      Sign in
    </button>
  </form>
</div>;`
  );
});

$(".home-page").on("click", () => {
  $(".login-container").hide();
  $(".signin-container").hide();
  $(".container").html(`  <div class="enter-container">
        <label for="room-name">Enter Room Name:</label>
        <input type="text" id="room-name" name="room-name" />
        <button class="enter-btn">Enter</button>
      </div>`);
});
