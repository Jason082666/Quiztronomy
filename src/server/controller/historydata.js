import { userHistory, searchGameRoomData } from "../models/historydata.js";
import errors from "../models/errorhandler.js";

export const findUserHistory = async (req, res, next) => {
  const { userId } = req.query;
  if (!userId) return next(new errors.ParameterError(["userId"], 400));
  const data = await userHistory(userId);
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
