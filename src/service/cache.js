import { redisClient } from "../util/cacheConnection.js";

const deleteKey = async (key) => {
  return redisClient.del(key);
};

export const deleteGroupKey = async (keys) => {
  for (let key of keys) {
    await deleteKey(key);
  }
};
