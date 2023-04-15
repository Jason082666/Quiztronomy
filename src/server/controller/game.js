import {
  createRoom,
  enterRoom,
  // leaveRoom,
  createRoomOnRedis,
  terminateRoom,
  saveQuizzIntoRoom,
  startRoom,
  getCurrentQuizzFromMongo,
  getCurrentQuizzFromRedis,
} from "../models/game.js";
import { redisClient } from "../models/redis.js";
import errors from "../models/errorhandler.js";

export const createGameRoom = async (req, res) => {
  const { userId, name } = req.session.user;
  const data = await createRoom(userId, name);
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

export const enterGameRoom = async (req, res, next) => {
  const { userId, name } = req.session.user;
  const { roomId } = req.body;
  if (!roomId || !userId || !name)
    return next(new errors.ParameterError(["userId", "roomId", "name"], 400));
  if (
    typeof roomId !== "string" ||
    typeof userId !== "string" ||
    typeof name !== "string"
  )
    return next(
      new errors.TypeError(
        { roomId: "string", userId: "string", name: "string" },
        400
      )
    );
  const result = await enterRoom(roomId, userId, name);
  if (result === null)
    return next(
      new errors.CustomError(
        `Room ${roomId} is not existed or the game has started`,
        400
      )
    );
  if (!result)
    return next(new errors.CustomError(`You are already in the room`, 400));
  return res.json({ data: { userId, userName: name } });
};

// //TODO: 把cookie代的資料進行驗證放在id,name中，前面要有一個驗證的middleware
// export const leaveGameRoom = async (req, res, next) => {
//   const { userId } = req.session.user;
//   const { roomId } = req.body;
//   if (!roomId) return next(new errors.ParameterError(["id"], 400));
//   if (typeof roomId !== "string")
//     return next(new errors.TypeError({ roomId: "string" }, 400));
//   const result = await leaveRoom(roomId, userId);
//   if (result === null)
//     return next(new errors.CustomError(`Room ${roomId} is not existed`, 400));
//   if (!result)
//     return next(new errors.CustomError(`Player is not in room ${roomId}`, 400));
//   return res.json({ message: `Leave room ${roomId} !` });
// };

//TODO: 把cookie代的資料進行驗證放在id,name中，前面要有一個驗證的middleware
export const startGameRoom = async (req, res, next) => {
  const { userId } = req.session.user;
  const { roomId } = req.body;
  if (!roomId || !userId)
    return next(new errors.ParameterError(["roomId", "userId"], 400));
  if (typeof roomId !== "string" || typeof userId !== "string")
    return next(
      new errors.TypeError({ roomId: "string", userId: "string" }, 400)
    );
  const data = await startRoom(roomId, userId);
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
  const { userId, name } = req.session.user;
  const { roomId } = req.body;
  if (!roomId) return next(new errors.ParameterError(["roomId"], 400));
  if (typeof roomId !== "string")
    return next(new errors.TypeError({ roomId: "string" }, 400));
  const data = await createRoomOnRedis(roomId, userId, name);
  if (data === undefined)
    return next(new errors.CustomError("Quizz list is empty", 400));
  if (data === null)
    return next(new errors.CustomError(`Room ${roomId} is not available`, 400));
  if (!data) return next(new errors.CustomError(`Fail to create room`, 400));
  return res.json({ message: "success" });
};
