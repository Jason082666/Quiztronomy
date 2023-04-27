import { MyGameRoom } from "../src/server/models/mongodb.js";
import { redisClient } from "../src/server/models/redis.js";
import {
  addGameHistoryToPlayer,
  addGameInfoToRedis,
} from "../src/server/models/historydata.js";
redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (error) => {
  console.error("Error connecting to Redis", error);
});

const funct = async () => {
  while (redisClient.status !== "reconnecting") {
    const object = await redisClient.brpop("saveScoreToMongo", 1);
    if (object) {
      try {
        const parseObject = JSON.parse(object[1]);
        const { roomId, uniqueId } = parseObject;
        const rank = await redisClient.zrevrange(
          `${roomId} -score`,
          0,
          -1,
          "WITHSCORES"
        );
        console.log("rank", rank);
        const gameRoom = await MyGameRoom.findOne({ _id: uniqueId });
        const gameName = gameRoom.name;
        const date = gameRoom.date;
        const host = gameRoom.founder.name;
        const result = [];
        for (let i = 0; i < rank.length; i += 2) {
          const playerInfo = JSON.parse(rank[i]);
          const id = Object.keys(playerInfo)[0];
          const name = Object.values(playerInfo)[0];
          const score = rank[i + 1];
          const ranking = i + 1;
          if (id.length !== 36) {
            await addGameHistoryToPlayer(
              id,
              uniqueId,
              gameName,
              date,
              host,
              ranking,
              score
            );
          }
          result.push({ id, name, score });
        }
        gameRoom.score = result;
        const gameRoomData = await gameRoom.save();
        await addGameInfoToRedis(uniqueId, gameRoomData);
        await redisClient.zremrangebyrank(`${roomId} -score`, 0, -1);
        return true;
      } catch (e) {
        // 這邊要做錯誤處理=> 丟到error handling 的queque
        console.error(e);
        return undefined;
      }
    }
  }
};

funct();
