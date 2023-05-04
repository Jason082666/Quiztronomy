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
