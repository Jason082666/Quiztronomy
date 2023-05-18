import express from "express";
import http from "http";
import path from "path";
import session from "express-session";
import RedisStore from "connect-redis";
import { socketio } from "./socketio.js";
import { redisClient } from "./util/cacheConnection.js";
import { Database } from "./util/mongoConnection.js";
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const app = express();
const server = http.createServer(app);
Database.connection;
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
app.use("/img", express.static(path.join(__dirname, ".", "public", "static")));

app.use(
  session({
    store: redisStore,
    resave: true, // required: force lightweight session keep alive (touch)
    saveUninitialized: false, // recommended: only save session when data exists
    secret: process.env.SESSION_SECRET,
    httpOnly: true,
    cookie: { maxAge: 3600000, sameSite: "strict" },
    rolling: true,
  })
);

import questionRoute from "./server/routes/question_route.js";
import gameRoute from "./server/routes/game_route.js";
import scoreRoute from "./server/routes/score_route.js";
import userRoute from "./server/routes/user_route.js";
import historyRoute from "./server/routes/historydata_route.js";
app.use("/api/" + APIVERSION, [
  questionRoute,
  gameRoute,
  scoreRoute,
  userRoute,
  historyRoute,
]);

import roomRoute from "./server/routes/room_route.js";
app.use("/", roomRoute);

app.use((req, res) => {
  return res
    .status(404)
    .sendFile(path.join(__dirname, ".", "public", "html", "404.html"));
});

app.use((err, req, res, next) => {
  console.error(err);
  const type = err.type || "system error";
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";
  const isOperational = err.isOperational || false;
  return res.status(statusCode).json({
    status,
    statusCode,
    error: err.message,
    type,
    isOperational,
  });
});

server.listen(PORT, () => {
  socketio(server);
});
