import { MyGameRoom } from "./mongoSchema.js";
import { redisClient } from "../../util/cacheConnection.js";

export const gameRoomExistence = async function (id) {
  const gameRoomResult = await MyGameRoom.findOne({
    id,
    roomStatus: { $ne: "closed" },
  });
  if (!gameRoomResult) return false;
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
  return await game.save();
};

export const createRoomOnRedis = async function (roomId, hostId, hostName) {
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
};

export const searchGameName = async function (roomId) {
  const result = await MyGameRoom.findOne({
    id: roomId,
    roomStatus: { $ne: "closed" },
  });
  if (!result) return "";
  return result.name;
};

export const setupDisconnectHash = async function (roomId) {
  await redisClient.hset(`${roomId}-disconnect`, "", "");
};

export const playerDisconnect = async function (roomId, userId, name) {
  const exists = await redisClient.exists(`${roomId}-disconnect`);
  if (exists == 0) {
    return false;
  }
  return await redisClient.hset(`${roomId}-disconnect`, userId, name);
};

export const checkDisconnectList = async function (roomId, userId) {
  const exists = await redisClient.hexists(`${roomId}-disconnect`, userId);
  if (!exists) return false;
  await redisClient.hdel(`${roomId}-disconnect`, userId);
  return true;
};

export const saveQuizIntoRoom = async function (array, roomId, founderId) {
  const maxQuizNumber = 40;
  if (array.length > maxQuizNumber) return false;
  const gameRoom = await MyGameRoom.findOne({
    id: roomId,
    roomStatus: "preparing",
    "founder.id": founderId,
  });
  gameRoom.quiz = array;
  await gameRoom.save();
  // Add quizData into Cache
  await redisClient.rpush(
    gameRoom.id,
    ...array.map((item) => JSON.stringify(item))
  );
  return true;
};

export const checkRoomStatus = async function (roomId, id) {
  const result = await redisClient.exists(`${roomId}-room`);
  if (result == 0) return false;
  const status = await redisClient.hget(`${roomId}-room`, "status");
  if (status === "prepared") {
    const hostId = await redisClient.hget(`${roomId}-room`, "host");
    // Prevent host from reentering the game room when in game-preparing stage.
    if (hostId === id) return false;
    return true;
  }
  return false;
};

export const enterRedisRoom = async function (roomId, id, name) {
  const respond = await redisClient.hset(`${roomId}-room`, id, name);
  if (respond == 0) return false;
  return true;
};

export const enterRoom = async function (roomId, id) {
  const result = await redisClient.exists(`${roomId}-room`);
  const enterTimes = await redisClient.zincrby(`${roomId}-connected`, 1, id);
  // To prevent single account uses different browser log in same game room.
  if (+enterTimes > 1 || result == 0) return false;
  return true; 
};

export const leaveRoom = async function (roomId, playerId) {
  redisClient.hdel(`${roomId}-room`, playerId);
  redisClient.zrem(`${roomId}-connected`, playerId);
};

export const startRoom = async function (roomId, founderId) {
  // delete status from Hash so that the other player cannot enter this room by directly paste this url due to the "checkRoomStatus function"
  // delete founderId so that founder data will not be transfer into Redis sorted set
  await redisClient.hdel(`${roomId}-room`, founderId);
  await redisClient.hdel(`${roomId}-room`, "status");
  const players = await redisClient.hgetall(`${roomId}-room`);
  delete players.host;
  delete players.status;
  const gameRoom = await MyGameRoom.findOne({
    id: roomId,
    roomStatus: "preparing",
    "founder.id": founderId,
  });
  // Add player data into game history
  gameRoom.roomStatus = "started";
  gameRoom.players = players;
  return await gameRoom.save();
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

export const addPlayerIntoRedisSortedSet = async function (gameRoom) {
  const { players } = gameRoom;
  for (let player in players) {
    const playerObj = {};
    playerObj[player] = players[player];
    const playerData = JSON.stringify(playerObj);
    await redisClient.zadd(`${gameRoom.id} -score`, 0, playerData);
  }
};

export const countQuizLength = async function (roomId) {
  return await redisClient.llen(roomId);
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
    await redisClient.lset(
      `${roomId}-player-answer`,
      index,
      stringifyNewAnswerObject
    );
  } finally {
    await redisClient.del(lockKey);
  }
};
export const getPlayerAnswerFromRedisList = async function (
  roomId,
  startIndex,
  endIndex
) {
  const playerAnswerList = await redisClient.lrange(
    `${roomId}-player-answer`,
    startIndex,
    endIndex
  );
  if (!playerAnswerList[0]) return [];
  return playerAnswerList;
};

export const getCurrentQuizFromRedis = async function (roomId, currentQuiz) {
  const length = await redisClient.llen(roomId);
  const result = await redisClient.lindex(roomId, +currentQuiz - 1);
  const data = JSON.parse(result);
  if (+currentQuiz === length) {
    data.lastquiz = true;
    return data;
  }
  return data;
};

export const hostOnRedis = async function (roomId) {
  const result = await redisClient.hget(`${roomId}-room`, "host");
  if (!result) return null;
  const hostObj = JSON.parse(result);
  return Object.values(hostObj)[0];
};
