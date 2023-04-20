import { redisClient } from "../models/redis.js";
import { MyGameRoom, MyUser } from "../models/mongodb.js";
export const addScore = async function (roomId, score, object) {
  if (redisClient.status === "reconnecting") return false;
  const data = JSON.stringify(object);
  const roomExist = await redisClient.exists(`${roomId} -score`);
  if (!roomExist) return false;
  const playerExist = await redisClient.zscore(`${roomId} -score`, data);
  if (!playerExist) return false;
  const result = await redisClient.zadd(
    `${roomId} -score`,
    "INCR",
    +score,
    data
  );
  console.log(result);
  const finalscore = await redisClient.zscore(`${roomId} -score`, data);
  return finalscore;
};

export const showRank = async function (roomId, ranknum) {
  if (redisClient.status === "reconnecting") return [];
  const rank = await redisClient.zrevrange(
    `${roomId} -score`,
    0,
    -1,
    "WITHSCORES"
  );
  const newRank = rank.slice(0, +ranknum * 2);
  const result = [];
  for (let i = 0; i < newRank.length; i += 2) {
    const parseObj = JSON.parse(newRank[i]);
    const id = Object.keys(parseObj)[0];
    const name = parseObj[id];
    const score = newRank[i + 1];
    result.push({ id, name, score });
  }
  return result;
};

export const addToQuequeAndUpdateMongo = async function (roomId) {
  const gameRoom = await MyGameRoom.findOne({
    id: roomId,
    roomStatus: "started",
  });
  if (!gameRoom) return null;
  const uniqueId = gameRoom._id;
  gameRoom.roomStatus = "closed";
  await gameRoom.save();
  if (redisClient.status === "reconnecting") return false;
  await redisClient.del(`${roomId}`);
  const roomExist = await redisClient.exists(`${roomId} -score`);
  if (!roomExist) return false;
  const uniqueObject = JSON.stringify({ uniqueId, roomId });
  await redisClient.lpush("saveScoreToMongo", uniqueObject);
  return true;
};

export const addGameHistory = async function (roomId, historyArray) {
  const gameRoom = await MyGameRoom.findOne({
    id: roomId,
    roomStatus: "started",
  });
  if (!gameRoom) return null;
  gameRoom.history = historyArray;
  await gameRoom.save();
  return;
};

export const addGameHistoryToPlayer = async function (id, roomId) {
  const myUser = await MyUser.findOne({ _id: id });
  if (!myUser) return null;
  console.log("userhistory1", myUser.history);
  myUser.history.unshift(roomId);
  console.log("userhistory2", myUser.history);
  await myUser.save();
  return;
};
