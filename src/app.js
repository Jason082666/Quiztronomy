import express from "express";
import http from "http";
import path from "path";
import session from "express-session";
import RedisStore from "connect-redis";
import { socketio } from "./socketio.js";
import { redisClient } from "./server/models/redis.js";
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const APIVERSION = "1.0";
let redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
});
app.use(express.json());
app.use(express.static(path.join(__dirname, ".", "public", "html")));
app.use("/js", express.static(path.join(__dirname, ".", "public", "js")));
app.use("/css", express.static(path.join(__dirname, ".", "public", "css")));


app.use(
  session({
    store: redisStore,
    resave: false, // required: force lightweight session keep alive (touch)
    saveUninitialized: false, // recommended: only save session when data exists
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 3600000, sameSite: "strict" },
  })
);

import questionRoute from "./server/routes/question_route.js";
import gameRoute from "./server/routes/game_route.js";
import scoreRoute from "./server/routes/score_route.js";
import userRoute from "./server/routes/user_route.js";
app.use("/api/" + APIVERSION, [
  questionRoute,
  gameRoute,
  scoreRoute,
  userRoute,
]);

app.get("/game/room/:roomId", (req, res) => {
  // 這邊到時候要做cookie裡面username,userid的驗證，其實就是再去fetch enterroom的api
  // const filePath = path.join(__dirname, "src/public/html/game/room.html");
  return res.sendFile(
    path.join(__dirname, ".", "public", "html", "game", "room.html")
  );
});
app.use((req, res) => {
  return res
    .status(404)
    .sendFile(path.join(__dirname, ".", "public", "html", "404.html"));
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
