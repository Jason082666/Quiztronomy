const canvas = $("#canvas")[0];
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const stars = [];

function init() {
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 2;
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
    ctx.fillStyle = stars[i].color || "#0e1a3c";
    ctx.fill();
  }
}

function update() {
  for (let i = 0; i < stars.length; i++) {
    if (isMouseNear(stars[i])) {
      stars[i].color = "#ffffff";
    } else {
      stars[i].color = null;
    }
  }
}

function isMouseNear(star) {
  const distance = Math.sqrt((star.x - mouse.x) ** 2 + (star.y - mouse.y) ** 2);
  return distance < 350;
}

let mouse = {
  x: 0,
  y: 0,
};

$(document).on("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function animate() {
  requestAnimationFrame(animate);
  draw();
  update();
}

init();
animate();
