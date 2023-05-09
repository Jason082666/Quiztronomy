const userStatus = await axios.get("/api/1.0/user/status");
const { data } = userStatus.data;
console.log(data);
if (data.error) {
  localStorage.clear();
} else {
  $("#enter-room-box").hide();
  $("#enter-box").show();
  $(".quick-enter").text(`Welcome back ${data.name} !`);
}
const canvasInfo = $("#canvas-info")[0];
const ctx = canvasInfo.getContext("2d");

canvasInfo.width = window.innerWidth;
canvasInfo.height = window.innerHeight;

const stars = [];

function init() {
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * canvasInfo.width;
    const y = Math.random() * canvasInfo.height;
    const radius = Math.random() * 2;
    stars.push({ x, y, radius });
  }
}

function draw() {
  ctx.clearRect(0, 0, canvasInfo.width, canvasInfo.height);
  ctx.fillStyle = "#0e1a3c";
  ctx.fillRect(0, 0, canvasInfo.width, canvasInfo.height);

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
const url = window.location.href;
const regex = /\/(\d+)$/;
const match = url.match(regex);
const roomId = match[1];
console.log(roomId);
let hostName;
try {
  const result = await axios.get(`/api/1.0/game/room?roomId=${roomId}`);
  hostName = result.data.data;
} catch (e) {
  window.location.href = "/404.html";
}

$(".host-info").text(`Host: ${hostName}`);
$(".enter-btn").on("click", async () => {
  const name = $("#user-name").val();
  if (name.length > 10) {
    return Toast.fire({
      icon: "error",
      title: "Name should be up to 10 characters.",
    });
  }
  try {
    await axios.post("/api/1.0/visitor/login", { name });
  } catch (e) {
    return Toast.fire({
      icon: "error",
      title: `Log in failed.`,
    });
  }

  try {
    const enterResult = await axios.post("/api/1.0/game/search", { roomId });
    const { data } = enterResult.data;
    localStorage.setItem("userName", data.userName);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("roomId", roomId);
    window.location.href = `/game/room/${roomId}`;
  } catch (e) {
    Toast.fire({
      icon: "error",
      title: `Room ${roomId} is empty.`,
    });
  }
});

$(".login-enter").on("click", async (e) => {
  e.preventDefault();
  try {
    const enterResult = await axios.post("/api/1.0/game/search", { roomId });
    const { data } = enterResult.data;
    localStorage.setItem("userName", data.userName);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("roomId", roomId);
    window.location.href = `/game/room/${roomId}`;
  } catch (e) {
    Toast.fire({
      icon: "error",
      title: `Room ${roomId} is empty.`,
    });
  }
});

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});
