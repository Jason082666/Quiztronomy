const roomId = localStorage.getItem("roomId");
$("h1").text(`Room ID : ${roomId}`);

$("#finish-button").on("click", async () => {
  // 這邊到時候要把savetoquizzapi做好
  const roomId = localStorage.getItem("roomId");
  const object = { roomId, status: "ready" };
  const result = await fetch("/api/1.0/game/roomupdate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(object),
  });
  const data = await result.json();
  if (data.error) return console.log(data.error);
  window.location.href = `/game/room/${roomId}`;
});
