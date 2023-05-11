import {
  createRoom,
  createRoomOnRedis,
  saveQuizIntoRoom,
  checkRoomStatus,
  enterRedisRoom,
  checkDisconnectList,
  searchGameName,
  findRoomOnRedis,
} from "../models/game.js";

import errors from "../../util/errorhandler.js";

export const createGameRoom = async (req, res, next) => {
  const { userId, name } = req.session.user;
  const { gameRoomName } = req.body;
  if (!userId || !name || !gameRoomName)
    return next(
      new errors.ParameterError(["userId", "name", "gameRoomName"], 400)
    );
  const data = await createRoom(userId, name, gameRoomName);
  res.json({ data });
};

export const searchGameNameofGame = async (req, res, next) => {
  const { roomId } = req.query;
  if (!roomId) return next(new errors.ParameterError(["roomId"], 400));
  const data = await searchGameName(roomId);
  if (!data) return next(new errors.CustomError("Room name not found", 400));
  res.json({ data });
};

export const checkDisconnection = async (req, res) => {
  const { userId } = req.session.user;
  const { roomId } = req.query;
  const result = await checkDisconnectList(roomId, userId);
  if (!result) return res.json({ data: "newPlayer" });
  return res.json({ data: "disconnection" });
};

export const saveQuizIntoGameRoom = async (req, res, next) => {
  const { array, roomId, founderId } = req.body;
  if (!array || !roomId || !founderId)
    return next(
      new errors.ParameterError(["Array", "roomId", "founderId"], 400)
    );
  if (typeof roomId !== "string" || typeof founderId !== "string")
    return next(
      new errors.TypeError({ roomId: "string", founderId: "string" }, 400)
    );
  const result = await saveQuizIntoRoom(array, roomId, founderId);
  if (!result)
    return next(
      new errors.CustomError("There should be at max 40 quizzes in a room", 400)
    );
  return res.json({ message: "saved" });
};
export const checkRoomAvailabilityAndEnter = async (req, res, next) => {
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
  const checkResult = await checkRoomStatus(roomId, userId);
  const enterRedisResult = await enterRedisRoom(roomId, userId, name);
  if (!checkResult || !enterRedisResult) {
    return next(
      new errors.CustomError(
        `Room ${roomId} is not existed or the game has started`,
        400
      )
    );
  }
  return res.json({ data: { userId, userName: name } });
};
export const findHostOnRedis = async (req, res, next) => {
  const { roomId } = req.query;
  if (!roomId) return next(new errors.ParameterError(["roomId"], 400));
  const data = await findRoomOnRedis(roomId);
  if (!data)
    return next(new errors.CustomError(`Room ${roomId} is not existed`, 400));
  res.json({ data });
};

export const createGameRoomOnRedis = async (req, res, next) => {
  const { userId, name } = req.session.user;
  const { roomId } = req.body;
  if (!roomId) return next(new errors.ParameterError(["roomId"], 400));
  if (typeof roomId !== "string")
    return next(new errors.TypeError({ roomId: "string" }, 400));
  await createRoomOnRedis(roomId, userId, name);
  return res.json({ message: "success" });
};
