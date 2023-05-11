import { redisClient } from "../src/util/cacheConnection.js";
import { updateNewPopById } from "../src/server/models/question.js";

const funct = async () => {
  while (redisClient.status !== "reconnecting") {
    const object = await redisClient.brpop("updatePopToES", 1);
    if (object) {
      try {
        const parseObject = JSON.parse(object[1]);
        for (let id in parseObject) {
          const num = parseObject[id];
          await updateNewPopById(id, num);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
};

funct();
