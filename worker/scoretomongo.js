import { MyGameRoom } from "../src/server/models/mongodb.js";
import dotenv from "dotenv";
import path from "path";
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", "src", ".env") });
import Redis from "ioredis";
export const redisClient = new Redis({
  host: process.env.MY_REDIS_HOST,
  port: parseInt(process.env.MY_REDIS_PORT),
  username: process.env.MY_REDIS_USERNAME,
  password: process.env.MY_REDIS_PASSWORD,
  retryStrategy: function (times) {
    if (times >= 5) {
      return 5000;
    }
    return 100;
  },
});

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
        const gameRoom = await MyGameRoom.findOne({ _id: uniqueId });
        gameRoom.score = rankArray;
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
