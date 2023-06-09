import { MyGameRoom, MyUser } from "./mongoSchema.js";
import { redisClient } from "../../util/cacheConnection.js";

export const userHistory = async function (userId, page) {
  const user = await MyUser.findOne({ _id: userId });
  if (!user) return [];
  const size = 6;
  const startIdx = +page * size;
  const endIdx = startIdx + size;
  return user.history.slice(startIdx, endIdx);
};

export const hostHistory = async function (userId, page) {
  const user = await MyUser.findOne({ _id: userId });
  if (!user) return [];
  const size = 6;
  const startIdx = +page * size;
  const endIdx = startIdx + size;
  return user.hostHistory.slice(startIdx, endIdx);
};

export const countUserHistory = async function (userId) {
  const user = await MyUser.findOne({ _id: userId });
  return user.history.length;
};

export const countHostHistory = async function (userId) {
  const user = await MyUser.findOne({ _id: userId });
  return user.hostHistory.length;
};

export const addGameHistory = async function (roomId, historyArray) {
  const gameRoom = await MyGameRoom.findOne({
    id: roomId,
    roomStatus: "started",
  });
  if (!gameRoom) return null;
  gameRoom.history = historyArray.map((historyObject) => {
    return JSON.parse(historyObject);
  });
  await gameRoom.save();
  return gameRoom;
};

export const addGameHistoryToPlayer = async function (
  id,
  roomId,
  roomName,
  date,
  host,
  rank,
  score
) {
  const myUser = await MyUser.findOne({ _id: id });
  if (!myUser) return null;
  myUser.totalScore += +score;
  myUser.totalGame += 1;
  myUser.history.unshift({ roomId, roomName, date, host, rank, score });
  await myUser.save();
  return myUser.history;
};

export const addGameHistoryToHost = async function (
  id,
  roomId,
  roomName,
  date
) {
  const myUser = await MyUser.findOne({ _id: id });
  myUser.totalGame += 1;
  if (!myUser) return null;
  myUser.hostHistory.unshift({ roomId, roomName, date });
  await myUser.save();
  return myUser.hostHistory;
};

export const findTotalScoreAndGame = async function (userId) {
  const myUser = await MyUser.findOne({ _id: userId });
  if (!myUser) return null;
  const score = myUser.totalScore;
  const game = myUser.totalGame;
  return { score, game };
};

export const addGameInfoToRedis = async function (
  roomUniqueId,
  gameRoomObject
) {
  const cacheValidDuration = 86400;
  const stringifyRoomObject = JSON.stringify(gameRoomObject);
  await redisClient.set(`${roomUniqueId}-gameRoom`, stringifyRoomObject);
  await redisClient.expire(`${roomUniqueId}-gameRoom`, cacheValidDuration);
};

export const searchGameRoomData = async function (roomUniqueId) {
  const cacheValidDuration = 86400;
  const exists = await redisClient.exists(`${roomUniqueId}-gameRoom`);
  // if the room history is not in Cache, get it from DB and set it in Cache.
  if (!exists) {
    const gameRoomObject = await MyGameRoom.findOne({ _id: roomUniqueId });
    if (!gameRoomObject) return null;
    const stringifyRoomObject = JSON.stringify(gameRoomObject);
    await redisClient.set(`${roomUniqueId}-gameRoom`, stringifyRoomObject);
    await redisClient.expire(`${roomUniqueId}-gameRoom`, cacheValidDuration);
    return gameRoomObject;
  }
  const gameRoomData = await redisClient.get(`${roomUniqueId}-gameRoom`);
  return JSON.parse(gameRoomData);
};
