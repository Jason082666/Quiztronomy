import { redisClient } from "../models/redis.js";
import { MyGameRoom } from "../models/mongodb.js";
export const addScore = async function (roomId, score, object) {
  if (redisClient.status === "reconnecting") return false;
  try {
    const data = JSON.stringify(object);
    const roomExist = await redisClient.exists(`${roomId} -score`);
    if (!roomExist) return false;
    const playerExist = await redisClient.zscore(`${roomId} -score`, data);
    if (!playerExist) return false;
    await redisClient.zadd(`${roomId} -score`, +score, data);
    const score = await redisClient.zscore(`${roomId} -score`, data);
    return score;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const showRank = async function (roomId, ranknum) {
  if (redisClient.status === "reconnecting") return [];
  try {
    const rank = await redisClient.zrevrange(
      `${roomId} -score`,
      0,
      -1,
      "WITHSCORES"
    );
    const newRank = rank.slice(0, +ranknum * 2);
    const result = [];
    for (let i = 0; i < newRank.length; i += 2) {
      const { id, name } = JSON.parse(newRank[i]);
      const score = newRank[i + 1];
      result.push({ id, name, score });
    }
    let previousScore = null;
    let currentRank = 0;
    let previousRank = 1;
    const rankArray = result.reduce((acc, e) => {
      currentRank++;
      if (e.score === previousScore) {
        e.rank = previousRank;
      } else {
        previousScore = e.score;
        previousRank = currentRank;
        e.rank = currentRank;
      }
      return [...acc, e];
    }, []);
    return rankArray;
  } catch (e) {
    console.error(e);
    return [];
  }
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
  try {
    const uniqueObject = JSON.stringify({ uniqueId, roomId });
    await redisClient.lpush("saveScoreToMongo", uniqueObject);
  } catch (e) {
    console.error(e);
    return false;
  }
  return true;
};
