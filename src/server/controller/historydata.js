import {
  userHistory,
  searchGameRoomData,
  countUserHistory,
  countHostHistory,
  hostHistory,
  findTotalScoreAndGame,
} from "../models/historydata.js";
import errors from "../models/errorhandler.js";

export const findUserHistory = async (req, res, next) => {
  const { userId, paging } = req.query;
  if (!userId || !paging)
    return next(new errors.ParameterError(["userId", "paging"], 400));
  if (!Number.isInteger(+paging) || +paging < 0)
    return next(new errors.CustomError("invalid page", 400));
  const result = await countUserHistory(userId);
  if (result == 0) return res.json({ data: "no data" });
  const length = result / 6;
  if (Number.isInteger(length)) {
    if (+paging === length - 1) {
      const data = await userHistory(userId, paging);
      return res.json({ data });
    } else if (+paging < length - 1) {
      const data = await userHistory(userId, paging);
      return res.json({ data, next: +paging + 1 });
    } else {
      return next(new errors.CustomError("invalid page", 400));
    }
  } else {
    if (+paging === Math.floor(length)) {
      const data = await userHistory(userId, paging);
      return res.json({ data });
    } else if (+paging < Math.floor(length)) {
      const data = await userHistory(userId, paging);
      return res.json({ data, next: +paging + 1 });
    } else {
      return next(new errors.CustomError("invalid page", 400));
    }
  }
};

export const findHostHistory = async (req, res, next) => {
  const { userId, paging } = req.query;
  if (!userId || !paging)
    return next(new errors.ParameterError(["userId", "paging"], 400));
  if (!Number.isInteger(+paging) || +paging < 0)
    return next(new errors.CustomError("invalid page", 400));
  const result = await countHostHistory(userId);
  if (result == 0) return res.json({ data: "no data" });
  const length = result / 6;
  if (Number.isInteger(length)) {
    if (+paging === length - 1) {
      const data = await hostHistory(userId, paging);
      return res.json({ data });
    } else if (+paging < length - 1) {
      const data = await hostHistory(userId, paging);
      return res.json({ data, next: +paging + 1 });
    } else {
      return next(new errors.CustomError("invalid page", 400));
    }
  } else {
    if (+paging === Math.floor(length)) {
      const data = await hostHistory(userId, paging);
      return res.json({ data });
    } else if (+paging < Math.floor(length)) {
      const data = await hostHistory(userId, paging);
      return res.json({ data, next: +paging + 1 });
    } else {
      return next(new errors.CustomError("invalid page", 400));
    }
  }
};

export const findTotalScoreAndGameOfUser = async (req, res, next) => {
  const { userId } = req.query;
  if (!userId) return next(new errors.ParameterError(["userId"], 400));
  const data = await findTotalScoreAndGame(userId);
  if (!data) return next(new errors.CustomError("User not found", 400));
  res.json({ data });
};

export const findGameRoomData = async (req, res, next) => {
  const { uniqueRoomId } = req.query;
  if (!uniqueRoomId)
    return next(new errors.ParameterError(["uniqueRoomId"], 400));
  const data = await searchGameRoomData(uniqueRoomId);
  if (!data)
    return next(new errors.CustomError("game room does not exist", 400));
  res.json({ data });
};
