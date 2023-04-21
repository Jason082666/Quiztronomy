import { MyUser, MyGameRoom } from "../models/mongodb.js";
import { redisClient } from "../models/redis.js";

export const userHistory = async function (userId, page) {
  const user = await MyUser.findOne({ _id: userId });
  if (!user) return false;
  const size = 6;
  const startIdx = +page * size;
  const endIdx = startIdx + size;
  const history = user.history.slice(startIdx, endIdx);
  return history;
};

export const countUserHistory = async function (userId) {
  const user = await MyUser.findOne({ _id: userId });
  if (!user) return false;
  return user.history.length;
};

export const addGameHistory = async function (roomId, historyArray) {
  const gameRoom = await MyGameRoom.findOne({
    id: roomId,
    roomStatus: "started",
  });
  if (!gameRoom) return null;
  gameRoom.history = historyArray;
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
  myUser.history.unshift({ roomId, roomName, date, host, rank, score });
  await myUser.save();
  return myUser.history;
};

export const addGameInfoToRedis = async function (
  roomUniqueId,
  gameRoomObject
) {
  if (redisClient.status === "reconnecting") return false;
  const stringifyRoomObject = JSON.stringify(gameRoomObject);
  await redisClient.set(`${roomUniqueId}-gameRoom`, stringifyRoomObject);
  await redisClient.expire(`${roomUniqueId}-gameRoom`, 86400);
};

export const searchGameRoomData = async function (roomUniqueId) {
  // 如果redis連線異常，則從mongo db拿
  if (redisClient.status === "reconnecting") {
    const gameRoomObject = await MyGameRoom.findOne({ _id: roomUniqueId });
    return gameRoomObject;
  }
  // 檢查redis中是否有這個key，如果沒有則從mongo db 拿，且把資料傳上快取，且設定ttl。
  const exists = await redisClient.exists(`${roomUniqueId}-gameRoom`);
  if (!exists) {
    const gameRoomObject = await MyGameRoom.findOne({ _id: roomUniqueId });
    if (!gameRoomObject) return null;
    const stringifyRoomObject = JSON.stringify(gameRoomObject);
    await redisClient.set(`${roomUniqueId}-gameRoom`, stringifyRoomObject);
    await redisClient.expire(`${roomUniqueId}-gameRoom`, 86400);
    return gameRoomObject;
  }
  const gameRoomData = await redisClient.get(`${roomUniqueId}-gameRoom`);
  return JSON.parse(gameRoomData);
};
