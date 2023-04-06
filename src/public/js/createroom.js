const roomId = localStorage.getItem("roomId");
$("h1").text(`Room ID : ${roomId}`);

$("#finish-button").on("click", async () => {
  // 這邊到時候要把savetoquizzapi做好
  const roomId = localStorage.getItem("roomId");
  const object = { roomId, status: "ready" };
  const result = await axios.post("/api/1.0/game/roomupdate", object);
  const { data } = result;
  if (data.error) return console.log(data.error);
  window.location.href = `/game/room/${roomId}`;
});
