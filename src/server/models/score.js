import { redisClient } from "../../util/cacheConnection.js";
import { MyGameRoom } from "./mongoSchema.js";

export const addScore = async function (roomId, score, playerObject) {
  const data = JSON.stringify(playerObject);
  const roomExist = await redisClient.exists(`${roomId} -score`);
  if (!roomExist) return false;
  const addResult = await redisClient.zscore(`${roomId} -score`, data);
  if (!addResult) return false;
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
  // to extract only data from sorted set
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

export const addToQueueAndUpdateMongo = async function (roomId) {
  const gameRoom = await MyGameRoom.findOne({
    id: roomId,
    roomStatus: "started",
  });
  if (!gameRoom) return false;
  const uniqueId = gameRoom._id;
  gameRoom.roomStatus = "closed";
  await gameRoom.save();
  await redisClient.del(`${roomId}`);
  const uniqueObject = JSON.stringify({ uniqueId, roomId, errorCount: 0 });
  await redisClient.lpush("saveScoreToMongo", uniqueObject);
  return true;
};
