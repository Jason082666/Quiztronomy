import { MyGameRoom } from "../models/mongodb.js";
import { redisClient } from "../models/redis.js";
//TODO:之後可以用CRONTAB來刪掉建立太久的房間
export const gameRoomExistence = async function (id) {
  const result = await MyGameRoom.findOne({
    id,
    roomStatus: { $ne: "closed" },
  });
  if (!result) return false;
  return true;
};

export const createRoom = async function (id, name, gameRoomName) {
  let roomId;
  do {
    roomId = Math.floor(Math.random() * 100000000).toString();
  } while (roomId.length !== 8 || (await gameRoomExistence(roomId)));
  const game = new MyGameRoom({
    id: roomId,
    name: gameRoomName,
    founder: { id, name },
  });
  const result = await game.save();
  let dataObj = result.toObject();
  delete dataObj["_id"];
  delete dataObj["__v"];
  return dataObj;
};

export const createRoomOnRedis = async function (roomId, hostId, hostName) {
  if (redisClient.status === "reconnecting") {
    return false;
  }
  const obj = {};
  obj[hostId] = hostName;
  const hostObj = JSON.stringify(obj);
  await redisClient.hset(
    `${roomId}-room`,
    "host",
    hostObj,
    "status",
    "prepared",
    hostId,
    "true"
  );
  return true;
};

export const setupDisconnectHash = async function (roomId) {
  await redisClient.hset(`${roomId}-disconnect`, "", "");
};

export const playerDisconnect = async function (roomId, userId, name) {
  if (redisClient.status === "reconnecting") {
    return false;
  }
  const exists = await redisClient.exists(`${roomId}-disconnect`);
  if (exists == 0) {
    return false;
  }
  const result = await redisClient.hset(`${roomId}-disconnect`, userId, name);
  return result;
};

export const searchGameName = async function (roomId) {
  const result = await MyGameRoom.findOne({
    id: roomId,
    roomStatus: { $ne: "closed" },
  });
  if (!result) return "";
  return result.name;
};

export const checkDisconnectList = async function (roomId, userId) {
  const exists = await redisClient.hexists(`${roomId}-disconnect`, userId);
  if (!exists) return false;
  await redisClient.hdel(`${roomId}-disconnect`, userId);
  return true;
};

export const saveQuizzIntoRoom = async function (array, roomId, founderId) {
  if (array.length > 40) return undefined;
  const gameRoom = await MyGameRoom.findOne({
    id: roomId,
    roomStatus: "preparing",
    "founder.id": founderId,
  });
  if (!gameRoom) return null;
  gameRoom.quizz = array;
  await gameRoom.save();
  if (redisClient.status === "reconnecting") {
    return;
  }
  await redisClient.rpush(
    gameRoom.id,
    ...array.map((item) => JSON.stringify(item))
  );
  return true;
};

export const checkRoomStatus = async function (roomId, id, name) {
  if (redisClient.status === "reconnecting") return null;
  const result = await redisClient.exists(`${roomId}-room`);
  if (result == 0) return null;
  const status = await redisClient.hget(`${roomId}-room`, "status");
  if (status === "prepared") {
    const hostId = await redisClient.hget(`${roomId}-room`, "host");
    if (hostId === id) return undefined;
    const respond = await redisClient.hset(`${roomId}-room`, id, name);
    if (respond == 0) return undefined;
    return true;
  }
  return false;
};

export const enterRoom = async function (roomId, id) {
  if (redisClient.status === "reconnecting") return null;
  const result = await redisClient.exists(`${roomId}-room`);
  if (result == 0) return null;
  const enterTimes = await redisClient.zincrby(`${roomId}-connected`, 1, id);
  console.log("entertines", enterTimes);
  if (+enterTimes > 1) return false;
  return true;
};

export const leaveRoom = async function (roomId, playerId) {
  if (redisClient.status === "reconnecting") return null;
  const roomExist = await redisClient.exists(`${roomId}-room`);
  if (roomExist == 0) return null;
  await redisClient.hdel(`${roomId}-room`, playerId);
  await redisClient.zrem(`${roomId}-connected`, playerId);
};

export const startRoom = async function (roomId, founderId) {
  const gameRoom = await MyGameRoom.findOne({
    id: roomId,
    roomStatus: "preparing",
    "founder.id": founderId,
  });
  if (!gameRoom) return {};
  gameRoom.roomStatus = "started";
  await gameRoom.save();
  if (redisClient.status === "reconnecting") {
    return {};
  }
  await redisClient.hdel(`${roomId}-room`, founderId);
  await redisClient.hdel(`${roomId}-room`, "status");
  const players = await redisClient.hgetall(`${roomId}-room`);
  delete players.host;
  delete players.status;
  if (Object.keys(players).length == 0) return {};
  gameRoom.players = players;
  await gameRoom.save();
  for (let player in players) {
    const playerObj = {};
    const name = players[player];
    playerObj[player] = name;
    const playerData = JSON.stringify(playerObj);
    await redisClient.zadd(`${gameRoom.id} -score`, 0, playerData);
  }
  const firstQuizz = await redisClient.lindex(roomId, 0);
  const length = await redisClient.llen(roomId);
  if (length == 1) {
    const parseFirstQuizz = JSON.parse(firstQuizz);
    parseFirstQuizz.lastquizz = true;
    return { firstQuizz: parseFirstQuizz, length: gameRoom.quizz.length };
  }
  const parseFirstQuizz = JSON.parse(firstQuizz);
  return { firstQuizz: parseFirstQuizz, length: gameRoom.quizz.length };
};

export const terminateRoom = async function (id) {
  const result = await MyGameRoom.deleteOne({
    id,
    roomStatus: { $ne: "closed" },
  });
  if (result.deletedCount === 0) {
    return false;
  }
  return true;
};

export const writePlayerAnswerIntoRedisList = async function (
  roomId,
  userId,
  index,
  answerArray
) {
  const lockKey = `${roomId}-player-answer-lock`;
  const lockAcquired = await redisClient.setnx(lockKey, "1");
  if (!lockAcquired) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return await writePlayerAnswerIntoRedisList(
      roomId,
      userId,
      index,
      answerArray
    );
  }

  try {
    const answerObject = await redisClient.lindex(
      `${roomId}-player-answer`,
      index
    );
    const stringifyNewAnswerObject = JSON.stringify({
      ...JSON.parse(answerObject ?? "{}"),
      ...{ [userId]: answerArray },
    });
    const listExists = await redisClient.exists(`${roomId}-player-answer`);
    if (
      listExists == 0 ||
      (await redisClient.llen(`${roomId}-player-answer`)) <= index
    ) {
      return await redisClient.rpush(
        `${roomId}-player-answer`,
        stringifyNewAnswerObject
      );
    }
    console.log("index to lset", index);
    await redisClient.lset(
      `${roomId}-player-answer`,
      index,
      stringifyNewAnswerObject
    );
  } finally {
    await redisClient.del(lockKey);
  }
};
export const getPlayerAnswerFromRedisList = async function (roomId) {
  const playerAnswerList = await redisClient.lrange(
    `${roomId}-player-answer`,
    0,
    -1
  );
  console.log(playerAnswerList);
  if (!playerAnswerList[0]) return [];
  return playerAnswerList;
};

export const getCurrentQuizzFromRedis = async function (roomId, currentQuizz) {
  if (redisClient.status === "reconnecting") {
    return undefined;
  }
  const length = await redisClient.llen(roomId);
  const result = await redisClient.lindex(roomId, +currentQuizz - 1);
  const data = JSON.parse(result);
  if (+currentQuizz === length) {
    data.lastquizz = true;
    return data;
  }
  return data;
};

export const getCurrentQuizzFromMongo = async function (roomId, currentQuizz) {
  const gameRoom = await MyGameRoom.findOne({
    id: roomId,
    roomStatus: "started",
  });
  if (!gameRoom) return null;
  const { quizz } = gameRoom;
  const length = quizz.length;
  const data = quizz[+currentQuizz - 1];
  if (!data) return null;
  if (length === +currentQuizz) {
    const newData = data.toObject();
    newData.lastquizz = true;
    return newData;
  }
  return data;
};

export const findHostAndUsers = async function (roomId) {
  const result = await redisClient.hgetall(`${roomId}-room`);
  const dataArray = [];
  for (const data in result) {
    if (data !== "status") {
      dataArray.push({ userId: data, userName: result[data] });
    }
  }
  return dataArray;
};

export const findRoomOnRedis = async function (roomId) {
  const result = await redisClient.hget(`${roomId}-room`, "host");
  if (!result) return undefined;
  const hostObj = JSON.parse(result);
  return Object.values(hostObj)[0];
};
