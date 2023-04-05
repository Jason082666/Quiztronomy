import {
  updateRoomStatus,
  createRoom,
  enterRoom,
  leaveRoom,
  terminateRoom,
  saveQuizzIntoRoom,
  startRoom,
  getCurrentQuizzFromMongo,
  getCurrentQuizzFromRedis,
} from "../models/game.js";
import errors from "../models/errorhandler.js";
import { redisClient } from "../models/redis.js";

// TODO: 這個ROUTE前面還要做一些身分驗證驗證ID,NAME
export const createGameRoom = async (req, res, next) => {
  const { id, name, limitPlayers } = req.body;
  if (!limitPlayers)
    return next(new errors.ParameterError([limitPlayers], 400));
  let data = await createRoom(id, name, limitPlayers);
  res.json({ data });
};

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
  if (result === undefined)
    return next(new errors.CustomError(`Room ${roomId} has no seats`, 400));
  return res.json({ message: `Enter room ${roomId} !` });
};

export const leaveGameRoom = async (req, res, next) => {
  const { roomId, id } = req.body;
  if (!roomId || !id)
    return next(new errors.ParameterError(["id", "roomId", "name"], 400));
  if (typeof roomId !== "string" || typeof id !== "string")
    return next(new errors.TypeError({ roomId: "string", id: "string" }, 400));
  const result = await leaveRoom(roomId, id);
  if (result === null)
    return next(new errors.CustomError(`Room ${roomId} is not existed`, 400));
  if (result === undefined)
    return next(new errors.CustomError(`Player is not in room ${roomId}`, 400));
  return res.json({ message: `Leave room ${roomId} !` });
};

export const saveQuizzIntoGameRoom = async (req, res, next) => {
  const { array, roomId } = req.body;
  if (!array || !roomId)
    return next(new errors.ParameterError(["Array", "roomId"], 400));
  if (typeof roomId !== "string")
    return next(new errors.TypeError({ roomId: "string" }, 400));
  const result = await saveQuizzIntoRoom(array, roomId);
  if (result === undefined)
    return next(
      new errors.CustomError("There sould be at max 40 quizzes in a room", 400)
    );
  if (result === null)
    return next(new errors.CustomError(`Room ${roomId} is not existed`, 400));
  if (!result) return res.json({ message: "saved", redisfailed: true });
  return res.json({ message: "saved", redisfailed: false });
};

export const startGameRoom = async (req, res, next) => {
  const { roomId } = req.body;
  if (!roomId) return next(new errors.ParameterError(["roomId"], 400));
  if (typeof roomId !== "string")
    return next(new errors.TypeError({ roomId: "string" }, 400));
  const data = await startRoom(roomId);
  if (data === false)
    return next(new errors.CustomError("Quizz list is empty", 400));
  if (data === null)
    return next(new errors.CustomError(`Room ${roomId} is not existed`, 400));
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
        `Room ${roomId} with roomStatus equals to ready is not existed`,
        400
      )
    );
  return res.json({ message: `Terminated room ${roomId}` });
};

export const getCurrentQuizz = async (req, res, next) => {
  // 這個redisfailed 是從local storage拿到的，如果failed，系統將去mongo拿資料
  // 如過題目當時沒有存到redis，queryString應該要redisStatus = failed, 反則redisStatus = success
  const { roomId, currentQuizz, redisStatus } = req.query;
  if (!roomId || !currentQuizz)
    return next(new errors.ParameterError(["roomId,currentQuizz"], 400));
  if (typeof roomId !== "string" || typeof currentQuizz !== "string")
    return next(
      new errors.TypeError({ roomId: "string", currentQuizz: "string" }, 400)
    );
  if (redisClient.status === "reconnecting" || redisStatus === "failed") {
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

export const updateGameRoomStatus = async (req, res, next) => {
  const { roomId, status } = req.body;
  if (!roomId || !status)
    return next(new errors.ParameterError(["roomId,status"], 400));
  if (typeof roomId !== "string" || typeof status !== "string")
    return next(
      new errors.TypeError({ roomId: "string", status: "string" }, 400)
    );
  const result = await updateRoomStatus(roomId, status);
  if (result === null)
    return next(new errors.CustomError(`Room ${roomId} is not existed`, 400));
  return res.json({ message: "Room status updated" });
};
