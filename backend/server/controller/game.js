import {
  createRoom,
  enterRoom,
  leaveRoom,
  createRoomOnRedis,
  terminateRoom,
  saveQuizzIntoRoom,
  startRoom,
  getCurrentQuizzFromMongo,
  getCurrentQuizzFromRedis,
} from "../models/game.js";
import errors from "../models/errorhandler.js";
import { redisClient } from "../models/redis.js";

export const createGameRoom = async (req, res, next) => {
  const { id, name } = req.body;
  const data = await createRoom(id, name);
  res.json({ data });
};

// TODO: 這個前面要身分驗證
export const saveQuizzIntoGameRoom = async (req, res, next) => {
  const { array, roomId, founderId } = req.body;
  if (!array || !roomId || !founderId)
    return next(
      new errors.ParameterError(["Array", "roomId", "founderId"], 400)
    );
  if (typeof roomId !== "string" || typeof founderId !== "string")
    return next(
      new errors.TypeError({ roomId: "string", founderId: "string" }, 400)
    );
  const result = await saveQuizzIntoRoom(array, roomId, founderId);
  if (result === undefined)
    return next(
      new errors.CustomError("There sould be at max 40 quizzes in a room", 400)
    );
  if (result === null)
    return next(
      new errors.CustomError(
        `Room ${roomId} is not existed or host validation failed`,
        400
      )
    );
  return res.json({ message: "saved" });
};

//TODO: 把cookie代的資料進行驗證放在id,name中，前面要有一個驗證的middleware
export const enterGameRoom = async (req, res, next) => {
  const { roomId, id, name } = req.body;
  if (!roomId || !id || !name)
    return next(new errors.ParameterError(["id", "roomId", "name"], 400));
  if (
    typeof roomId !== "string" ||
    typeof id !== "string" ||
    typeof name !== "string"
  )
    return next(
      new errors.TypeError(
        { roomId: "string", id: "string", name: "string" },
        400
      )
    );
  const result = await enterRoom(roomId, id, name);
  if (result === null)
    return next(
      new errors.CustomError(
        `Room ${roomId} is not existed or the game has started`,
        400
      )
    );
  if (!result)
    return next(new errors.CustomError(`You are already in the room`, 400));
  return res.json({ message: `Enter room ${roomId} !` });
};

//TODO: 把cookie代的資料進行驗證放在id,name中，前面要有一個驗證的middleware
export const leaveGameRoom = async (req, res, next) => {
  const { roomId, id } = req.body;
  if (!roomId || !id)
    return next(new errors.ParameterError(["id", "roomId"], 400));
  if (typeof roomId !== "string" || typeof id !== "string")
    return next(new errors.TypeError({ roomId: "string", id: "string" }, 400));
  const result = await leaveRoom(roomId, id);
  if (result === null)
    return next(new errors.CustomError(`Room ${roomId} is not existed`, 400));
  if (!result)
    return next(new errors.CustomError(`Player is not in room ${roomId}`, 400));
  return res.json({ message: `Leave room ${roomId} !` });
};

//TODO: 把cookie代的資料進行驗證放在id,name中，前面要有一個驗證的middleware
export const startGameRoom = async (req, res, next) => {
  const { roomId, hostId } = req.body;
  if (!roomId || !hostId)
    return next(new errors.ParameterError(["roomId", "hostId"], 400));
  if (typeof roomId !== "string" || typeof hostId !== "string")
    return next(
      new errors.TypeError({ roomId: "string", hostId: "string" }, 400)
    );
  const data = await startRoom(roomId, hostId);
  if (data === null)
    return next(new errors.CustomError(`Room ${roomId} is not existed`, 400));
  if (!data) return next(new errors.CustomError(`Fail to start the game`, 400));
  return res.json({ data });
};

export const terminateGameRoom = async (req, res, next) => {
  const { roomId } = req.body;
  if (!roomId) return next(new errors.ParameterError(["roomId"], 400));
  if (typeof roomId !== "string")
    return next(new errors.TypeError({ roomId: "string" }, 400));
  const data = await terminateRoom(roomId);
  if (!data)
    return next(
      new errors.CustomError(
        `Room ${roomId} with roomStatus equals to preparing is not existed`,
        400
      )
    );
  return res.json({ message: `Terminated room ${roomId}` });
};

export const getCurrentQuizz = async (req, res, next) => {
  // 如過題目當時沒有存到redis，queryString應該要redisStatus = failed, 反則redisStatus = success
  const { roomId, currentQuizz } = req.query;
  if (!roomId || !currentQuizz)
    return next(new errors.ParameterError(["roomId,currentQuizz"], 400));
  if (typeof roomId !== "string" || typeof currentQuizz !== "string")
    return next(
      new errors.TypeError({ roomId: "string", currentQuizz: "string" }, 400)
    );
  if (redisClient.status === "reconnecting") {
    const data = await getCurrentQuizzFromMongo(roomId, currentQuizz);
    if (!data)
      return next(new errors.CustomError("No this room or no this quizz", 400));
    return res.json({ data });
  }
  const data = await getCurrentQuizzFromRedis(roomId, currentQuizz);
  if (!data)
    return next(new errors.CustomError("No this room or no this quizz", 400));
  return res.json({ data });
};
//TODO: 把cookie代的資料進行驗證放在id,name中，前面要有一個驗證的middleware
export const createGameRoomOnRedis = async (req, res, next) => {
  const { roomId, hostId } = req.body;
  if (!roomId || !hostId)
    return next(new errors.ParameterError(["roomId", "hostId"], 400));
  if (typeof roomId !== "string" || typeof hostId !== "string")
    return next(
      new errors.TypeError({ roomId: "string", hostId: "string" }, 400)
    );
  const data = await createRoomOnRedis(roomId, hostId);
  if (data === undefined)
    return next(new errors.CustomError("Quizz list is empty", 400));
  if (data === null)
    return next(new errors.CustomError(`Room ${roomId} is not available`, 400));
  if (!data) return next(new errors.CustomError(`Fail to create room`, 400));
  return res.json({ message: "success" });
};
