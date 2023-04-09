import express from "express";
import http from "http";
import path from "path";
import cors from "cors";
import { socketio } from "./server/models/socketio.js";
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const APIVERSION = "1.0";
const allowedOrigins = ["http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json());
app.use(express.static("backend/public/html"));
app.use("/js", express.static("backend/public/js"));

import questionRoute from "./server/routes/question_route.js";
import gameRoute from "./server/routes/game_route.js";
import scoreRoute from "./server/routes/score_route.js";
app.use("/api/" + APIVERSION, [questionRoute, gameRoute, scoreRoute]);

app.get("/game/room/:roomId", (req, res) => {
  // 這邊到時候要做cookie裡面username,userid的驗證，其實就是再去fetch enterroom的api
  const filePath = path.join(__dirname, "/public/html/game/room.html");
  return res.sendFile(filePath);
});
app.use((req, res, next) => {
  return res.status(404).sendFile(__dirname + "/public/html/404.html");
});

app.use((err, req, res, next) => {
  console.log(err);
  const type = err.type || "system error";
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";
  return res.status(statusCode).json({
    status,
    statusCode,
    error: err.message,
    type,
  });
});

server.listen(PORT, () => {
  socketio(server);
});