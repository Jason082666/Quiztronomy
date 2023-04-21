import {
  userHistory,
  searchGameRoomData,
  countUserHistory,
} from "../models/historydata.js";
import errors from "../models/errorhandler.js";

export const findUserHistory = async (req, res, next) => {
  const { userId, paging } = req.query;
  if (!userId || !paging)
    return next(new errors.ParameterError(["userId", "paging"], 400));
  if (!Number.isInteger(+paging) || +paging < 0)
    return next(new errors.CustomError("invalid page", 400));
  const result = await countUserHistory(userId);
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
    console.log("length", length);
    if (+paging === Math.floor(length)) {
      const data = await userHistory(userId, paging);
      return res.json({ data });
    } else if (+paging < Math.floor(length)) {
      const data = await userHistory(userId, paging);
      return res.json({ data, next: +paging + 1 });
    } else {
      console.log("asa");
      return next(new errors.CustomError("invalid page", 400));
    }
  }
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
