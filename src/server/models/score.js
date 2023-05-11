import { redisClient } from "../../util/cacheConnection.js";
import { MyGameRoom } from "./mongoSchema.js";

export const addScore = async function (roomId, score, object) {
  const data = JSON.stringify(object);
  const roomExist = await redisClient.exists(`${roomId} -score`);
  if (!roomExist) return false;
  const playerExist = await redisClient.zscore(`${roomId} -score`, data);
  if (!playerExist) return false;
  await redisClient.zadd(`${roomId} -score`, "INCR", +score, data);
  return await redisClient.zscore(`${roomId} -score`, data);
};

export const showRank = async function (roomId, ranknum) {
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
  if (!gameRoom) return false;
  const uniqueId = gameRoom._id;
  gameRoom.roomStatus = "closed";
  await gameRoom.save();
  await redisClient.del(`${roomId}`);
  const uniqueObject = JSON.stringify({ uniqueId, roomId });
  await redisClient.lpush("saveScoreToMongo", uniqueObject);
  return true;
};
