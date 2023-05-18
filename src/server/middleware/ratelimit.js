import { redisClient } from "../../util/cacheConnection.js";
import errors from "../../util/errorhandler.js";
export const rateLimiter = (limitTime, limitReqests) => {
  return async function (req, res, next) {
    if (redisClient.status === "reconnecting") {
      next();
    }
    const ip =
      req.headers["x-forwarded-for"] ||
      req.headers["x-real-ip"] ||
      req.connection.remoteAddress;
    const requests = await redisClient.incr(ip);
    let ttl;
    if (requests === 1) {
      await redisClient.expire(ip, limitTime);
      ttl = limitTime;
    } else {
      ttl = await redisClient.ttl(ip);
    }
    if (requests > limitReqests) {
      return next(
        new errors.CustomError(`${ip} has send too many requests`, 429)
      );
    } else {
      next();
    }
  };
};
