import { MyGameRoom } from "../models/mongodb.js";
import { redisClient } from "../models/redis.js";
export const gameRoomExistence = async function (id) {
  const result = await MyGameRoom.findOne({
    id,
    roomStatus: { $ne: "closed" },
  });
  if (!result) return false;
  console.log(result);
  return true;
};

export const updateRoomStatus = async function (roomId, newStatus) {
  const gameRoom = await MyGameRoom.findOne({ id: roomId });
  if (!gameRoom) return null;
  gameRoom.roomStatus = newStatus;
  await gameRoom.save();
  return true;
};

// 當一場遊戲結束後founder的頁面會出現back to room 或是leave的按鈕，若是按下back to room其實就是再創一個新的房間號碼。(同一個api再發一次)(id,name,limitPlayers都應該在local storage中，其中預設的limitplayer可在個人設定中更改)
export const createRoom = async function (id, name, limitPlayers) {
  let roomId;
  do {
    roomId = Math.floor(Math.random() * 100000000).toString();
  } while (await gameRoomExistence(roomId));
  const game = new MyGameRoom({
    id: roomId,
    founder: { id, name },
    limitPlayers,
  });
  const result = await game.save();
  let dataObj = result.toObject();
  delete dataObj["_id"];
  delete dataObj["__v"];
  return dataObj;
};

export const enterRoom = async function (roomId, id, name) {
  const session = await MyGameRoom.startSession();
  session.startTransaction();
  try {
    const gameRoom = await MyGameRoom.findOne({
      id: roomId,
      roomStatus: "ready",
    }).session(session);
    if (!gameRoom) return null;
    if (gameRoom.players.length >= gameRoom.limitPlayers) {
      return undefined;
    }
    gameRoom.players.push({ id, name });
    await gameRoom.save({ session });
    await session.commitTransaction();
    return true;
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    return false;
  } finally {
    session.endSession();
  }
};

export const leaveRoom = async function (roomId, playerId) {
  const session = await MyGameRoom.startSession();
  session.startTransaction();
  try {
    const gameRoom = await MyGameRoom.findOne({
      id: roomId,
      roomStatus: "ready",
    }).session(session);
    if (!gameRoom) return null;
    const playerIndex = gameRoom.players.findIndex(
      (player) => player.id === +playerId
    );
    if (playerIndex === -1) {
      return undefined;
    }
    gameRoom.players.splice(playerIndex, 1);
    await gameRoom.save({ session });
    await session.commitTransaction();
    return true;
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    return false;
  } finally {
    session.endSession();
  }
};

export const startRoom = async function (roomId) {
  const session = await MyGameRoom.startSession();
  session.startTransaction();
  try {
    const gameRoom = await MyGameRoom.findOne({
      id: roomId,
      roomStatus: "ready",
    }).session(session);
    if (!gameRoom) return null;
    if (!gameRoom.quizz[0]) return false;
    gameRoom.roomStatus = "started";
    await gameRoom.save({ session });
    await session.commitTransaction();
    if (redisClient.status === "reconnecting") {
      return gameRoom.quizz[0];
    }
    const players = gameRoom.players;
    players.forEach(async (player) => {
      const newPlayer = player.toObject();
      delete newPlayer._id;
      delete newPlayer.__v;
      const playerData = JSON.stringify(newPlayer);
      await redisClient.zadd(`${gameRoom.id} -score`, 0, playerData);
    });
    return gameRoom.quizz[0];
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    return undefined;
  } finally {
    await session.endSession();
  }
};

export const terminateRoom = async function (roomId) {
  const deletedRoom = await MyGameRoom.findByIdAndDelete({
    id: roomId,
    roomStatus: "ready",
  });
  if (!deletedRoom) {
    return false;
  }
  return true;
};

export const saveQuizzIntoRoom = async function (array, roomId) {
  if (array.length > 40) return undefined;
  const gameRoom = await MyGameRoom.findOne({
    id: roomId,
    roomStatus: "preparing",
  });
  if (!gameRoom) return null;
  gameRoom.quizz = array;
  await gameRoom.save();
  if (redisClient.status === "reconnecting") {
    // 讓這個訊息給前端知道這些題目沒有被加到redis去，前端可以把這個訊息放在local storage。因此要題目需要到mongodb去要
    return false;
  }
  await redisClient.rpush(
    gameRoom.id,
    ...array.map((item) => JSON.stringify(item))
  );
  return true;
};

export const getCurrentQuizzFromRedis = async function (roomId, currentQuizz) {
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
    roomStatus: "ready",
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
