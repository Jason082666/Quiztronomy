import { MyUser } from "../models/mongoSchema.js";
import errors from "../../util/errorhandler.js";

export const autheticationForPlaying = async (req, res, next) => {
  if (!req.session.user)
    return next(new errors.CustomError("Log in fail", 400));
  return next();
};

export const authetication = async (req, res, next) => {
  if (!req.session.user || req.session.user.visitor)
    return next(new errors.CustomError("Log in fail", 400));
  const { userId, name } = req.session.user;
  const user = await MyUser.findOne({ _id: userId, name });
  if (!user) return next(new errors.CustomError("Authentiction failed", 403));
  return next();
};
