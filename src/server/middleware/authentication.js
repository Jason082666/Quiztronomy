import { MyUser } from "../models/mongodb.js";
import errors from "../models/errorhandler.js";

export const authetication = async (req, res, next) => {
  if (!req.session.user) return res.json({ data: { error: "log in fail" } });
  const { userId, name } = req.session.user;
  const user = await MyUser.findOne({ _id: userId, name });
  if (!user) return next(new errors.CustomError("Authentiction failed", 403));
  return next();
};