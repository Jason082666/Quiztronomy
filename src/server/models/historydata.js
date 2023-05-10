import {MyGameRoom, MyUser} from "../models/mongodb.js";
import {redisClient} from "../models/redis.js";

export const userHistory = async function (userId, page) {
  const user = await MyUser.findOne({ _id: userId });
  if (!user) return false;
  const size = 6;
  const startIdx = +page * size;
  const endIdx = startIdx + size;
  const history = user.history.slice(startIdx, endIdx);
  return history;
};

export const hostHistory = async function (userId, page) {
  const user = await MyUser.findOne({ _id: userId });
  if (!user) return false;
  const size = 6;
  const startIdx = +page * size;
  const endIdx = startIdx + size;
  const hostHistory = user.hostHistory.slice(startIdx, endIdx);
  return hostHistory;
};

export const countUserHistory = async function (userId) {
  const user = await MyUser.findOne({ _id: userId });
  if (!user) return false;
  return user.history.length;
};

export const countHostHistory = async function (userId) {
  const user = await MyUser.findOne({ _id: userId });
  if (!user) return false;
  return user.hostHistory.length;
};

export const addGameHistory = async function (roomId, historyArray) {
  const gameRoom = await MyGameRoom.findOne({
    id: roomId,
    roomStatus: "started",
  });
  if (!gameRoom) return null;
  const parsedHistoryArray = historyArray.map((historyObject) => {
    console.log("historyObject", historyObject);
    console.log("parseObject", JSON.parse(historyObject));
    return JSON.parse(historyObject);
  });
  console.log(parsedHistoryArray);
  gameRoom.history = parsedHistoryArray;
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
  if (redisClient.status === "reconnecting") return false;
  const stringifyRoomObject = JSON.stringify(gameRoomObject);
  await redisClient.set(`${roomUniqueId}-gameRoom`, stringifyRoomObject);
  await redisClient.expire(`${roomUniqueId}-gameRoom`, 86400);
};

export const searchGameRoomData = async function (roomUniqueId) {
  // 如果redis連線異常，則從mongo db拿
  if (redisClient.status === "reconnecting") {
    return await MyGameRoom.findOne({_id: roomUniqueId});
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
