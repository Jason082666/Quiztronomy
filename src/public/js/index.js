localStorage.clear();
for (let i = 1; i <= 100; i++) {
  let $option = $("<option>");
  $option.text(i);
  $option.val(i);
  $("#roomSize").append($option);
}

$("#join").on("click", async () => {
  const name = $("#name").val();
  const id = $("#id").val();
  const roomId = $("#roomId").val();
  localStorage.setItem("username", name);
  localStorage.setItem("userId", id);
  const object = { roomId, id, name };
  const result = await fetch("/api/1.0/game/enter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(object),
  });
  const data = await result.json();
  if (data.error) return console.log(data.error);
  localStorage.setItem("roomId", roomId);
  window.location.href = `/game/room/${roomId}`;
});

$("#create").on("click", async () => {
  const name = $("#name").val();
  const id = $("#id").val();
  localStorage.setItem("hostname", name);
  localStorage.setItem("hostId", id);
  const limitPlayers = $("#roomSize").val();
  const object = { name, id, limitPlayers };
  const result = await fetch("/api/1.0/game/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(object),
  });
  const data = await result.json();
  const roomId = data.data.id;
  localStorage.setItem("roomId", roomId);
  if (data.error) return console.log(data.error);
  window.location.href = "/game/createroom.html";
});
