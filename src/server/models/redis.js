import dotenv from "dotenv";
import path from "path";
import * as url from "url";
import Redis from "ioredis";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });
const tlsOptions = process.env.MY_REDIS_TLS
  ? JSON.parse(process.env.MY_REDIS_TLS)
  : {};
export const redisClient = new Redis({
  host: process.env.MY_REDIS_HOST,
  port: parseInt(process.env.MY_REDIS_PORT),
  username: process.env.MY_REDIS_USERNAME,
  password: process.env.MY_REDIS_PASSWORD,
  enableReadyCheck: true,
  tls: tlsOptions,
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

export const deleteKey = async (key) => {
  return redisClient.del(key);
};
