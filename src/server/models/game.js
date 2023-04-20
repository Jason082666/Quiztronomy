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

// 當一場遊戲結束後founder的頁面會出現back to room 或是leave的按鈕，若是按下back to room其實就是再創一個新的房間號碼。(同一個api再發一次)(id,name,limitPlayers都應該在local storage中，其中預設的limitplayer可在個人設定中更改)
export const createRoom = async function (id, name, gameRoomName) {
  let roomId;
  do {
    roomId = Math.floor(Math.random() * 100000000).toString();
  } while (await gameRoomExistence(roomId));
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
  await redisClient.hset(`${roomId}-room`, "host", hostObj);
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

export const enterRoom = async function (roomId, id, name) {
  if (redisClient.status === "reconnecting") return null;
  const result = await redisClient.exists(`${roomId}-room`);
  if (result == 0) return null;
  await redisClient.hlen(`${roomId}-room`);
  const hostId = await redisClient.hget(`${roomId}-room`, "host");
  if (hostId === id) return undefined;
  const respond = await redisClient.hset(`${roomId}-room`, id, name);
  if (respond == 0) return undefined;
  return true;
};

export const leaveRoom = async function (roomId, playerId, host = false) {
  if (redisClient.status === "reconnecting") return null;
  const roomExist = await redisClient.exists(`${roomId}-room`);
  if (roomExist == 0) return null;
  if (host) {
    const result = await redisClient.hdel(`${roomId}-room`, "host");
    if (result == 0) return undefined;
    const space = await redisClient.hlen(`${roomId}-room`);
    if (space == 0) {
      await redisClient.del(`${roomId}-room`);
      await redisClient.del(roomId);
    }
    return true;
  }
  const result = await redisClient.hdel(`${roomId}-room`, playerId);
  if (result == 0) return undefined;
  const space = await redisClient.hlen(`${roomId}-room`);
  if (space == 0) {
    await redisClient.del(`${roomId}-room`);
    await redisClient.del(roomId);
  }
  return true;
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
  const players = await redisClient.hgetall(`${roomId}-room`);
  delete players.host;
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
  await redisClient.del(`${roomId}-room`);
  const firstQuizz = await redisClient.lindex(roomId, 0);
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
