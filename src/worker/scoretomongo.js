import { MyGameRoom } from "../src/server/models/mongodb.js";
import { redisClient } from "../src/server/models/redis.js";
import {} from "../"
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
        const result = [];
        for (let i = 0; i < rank.length; i += 2) {
          const { id, name } = JSON.parse(rank[i]);
          const score = rank[i + 1];
          result.push({ id, name, score });
        }
        const gameRoom = await MyGameRoom.findOne({ _id: uniqueId });
        gameRoom.score = result;
        await gameRoom.save();
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
