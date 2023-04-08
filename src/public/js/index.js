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
  const object = { roomId, id, name };
  const result = await axios.post("/api/1.0/game/enter", object);
  const { data } = result;
  if (data.error) return console.log(data.error);
  localStorage.setItem("username", name);
  localStorage.setItem("userId", id);
  localStorage.setItem("roomId", roomId);
  window.location.href = `/game/room/${roomId}`;
});

$("#create").on("click", async () => {
  const name = $("#name").val();
  const id = $("#id").val();
  const limitPlayers = $("#roomSize").val();
  const object = { name, id, limitPlayers };
  const result = await axios.post("/api/1.0/game/create", object);
  const { data } = result;
  if (data.error) return console.log(data.error);
  const roomId = data.data.id;
  localStorage.setItem("roomId", roomId);
  localStorage.setItem("hostname", name);
  localStorage.setItem("hostId", id);
  localStorage.setItem("limitPlayers", limitPlayers);
  window.location.href = "/game/createroom.html";
});
