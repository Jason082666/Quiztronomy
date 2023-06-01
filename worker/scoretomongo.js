import { MyGameRoom } from "../src/server/models/mongoSchema.js";
import { redisClient } from "../src/util/cacheConnection.js";
import {
  addGameHistoryToPlayer,
  addGameInfoToRedis,
} from "../src/server/models/historydata.js";
import { Database } from "../src/util/mongoConnection.js";
Database.connection;
const funct = async () => {
  while (redisClient.status !== "reconnecting") {
    const object = await redisClient.brpop("saveScoreToMongo", 1);
    if (object) {
      const parseObject = JSON.parse(object[1]);
      const { roomId, uniqueId, errorCount } = parseObject;
      try {
        const rank = await redisClient.zrevrange(
          `${roomId} -score`,
          0,
          -1,
          "WITHSCORES"
        );
        const gameRoom = await MyGameRoom.findOne({ _id: uniqueId });
        const gameName = gameRoom.name;
        const date = gameRoom.date;
        const host = gameRoom.founder.name;
        const result = [];
        // Add this game data to all the players in the room. Update rank and score data to this game's history.
        for (let i = 0; i < rank.length; i += 2) {
          const playerInfo = JSON.parse(rank[i]);
          const id = Object.keys(playerInfo)[0];
          const name = Object.values(playerInfo)[0];
          const score = rank[i + 1];
          const ranking = i / 2 + 1;
          const visitorUUIDLength = 36;
          if (id.length !== visitorUUIDLength) {
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
        // Add this game history into Cache
        await addGameInfoToRedis(uniqueId, gameRoomData);
      } catch (e) {
        console.log(e);
        errorCount++;
        if (errorCount >= 5) {
          console.error(e);
          redisClient.lpush("error", JSON.stringify(parseObject));
        } else {
          parseObject.errorCount = errorCount;
          await redisClient.lpush(
            "saveScoreToMongo",
            JSON.stringify(parseObject)
          );
        }
      }
    }
  }
};

funct();
