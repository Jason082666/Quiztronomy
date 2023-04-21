import { MyUser, MyGameRoom } from "../models/mongodb.js";
import { redisClient } from "../models/redis.js";

export const userHistory = async function (userId) {
  if (redisClient.status === "reconnecting") {
    const user = await MyUser.findOne({ _id: userId });
    if (!user) return false;
    return user.history;
  }
  const listData = await redisClient.get(`${userId}-history`);
  // 如果no cache hit，則從資料庫拿，且把資料放到cache去，ttl設為一天
  console.log(listData);
  if (!listData) {
    const user = await MyUser.findOne({ _id: userId });
    if (!user) return false;
    await redisClient.set(`${userId}-history`, JSON.stringify(user.history));
    await redisClient.expire(`${userId}-history`, 86400);
    return user.history;
  }
  const parseListData = JSON.parse(listData);
  console.log(parseListData);
  await redisClient.expire(`${userId}-history`, 86400);
  return parseListData;
};

export const pushUserHistoryOnRedis = async function (userHistory, userId) {
  if (redisClient.status === "reconnecting") return false;
  const exists = await redisClient.exists(`${userId}-history`);
  if (exists) {
    // 如果redis中已經存在這個key，則直接push新的遊戲歷史紀錄
    const historyData = await redisClient.get(`${userId}-history`);
    const parseHistoryData = JSON.parse(historyData);
    parseHistoryData.unshift(JSON.stringify(userHistory));
    await redisClient.set(
      `${userId}-history`,
      JSON.stringify(parseHistoryData)
    );
  } else {
    // 如果redis中沒有這個key，則直接從mongo db把資料傳到redis
    await redisClient.set(`${userId}-history`, JSON.stringify(userHistory));
  }
  // 刷新ttl為一天
  await redisClient.expire(`${userId}-history`, 86400);
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
