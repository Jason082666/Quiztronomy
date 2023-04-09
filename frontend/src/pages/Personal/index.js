import React from "react";
import axios from "axios";
import "./style.css";

export default function EnterGame() {
  const handleJoin = async () => {
    const name = document.getElementById("name").value;
    const id = document.getElementById("id").value;
    const roomId = document.getElementById("roomId").value;
    const object = { roomId, id, name };
    const result = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/1.0/game/enter`,
      object
    );
    const { data } = result;
    if (data.error) return console.log(data.error);
    localStorage.setItem("username", name);
    localStorage.setItem("userId", id);
    localStorage.setItem("roomId", roomId);
    window.location.href = `/game/room/${roomId}`;
  };

  const handleCreate = async () => {
    const name = document.getElementById("name").value;
    const id = document.getElementById("id").value;
    const limitPlayers = document.getElementById("roomSize").value;
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
  };

  return (
    <div className="container">
      <h1>Enter Room</h1>
      <form>
        <div className="input-group">
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" />
        </div>
        <div className="input-group">
          <label htmlFor="id">Id:</label>
          <input type="text" id="id" />
        </div>
        <div className="input-group">
          <label htmlFor="roomId">RoomId:</label>
          <input type="text" id="roomId" />
        </div>
        <div className="button-group">
          <button id="join" onClick={handleJoin}>
            Join Room !
          </button>
          <button id="create" onClick={handleCreate}>
            Create Room !
          </button>
        </div>
      </form>
    </div>
  );
}
