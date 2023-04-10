import { MyUser } from "../models/mongodb.js";
import errors from "../models/errorhandler.js";

export const authetication = async (req, res, next) => {
  // TODO:
  console.log(req.session);
  const { userId, name } = req.session;
  console.log(userId, name);
  const user = await MyUser.findOne({ _id: userId, name });
  console.log(user);
  if (!user) return new errors.CustomError("Authentiction failed", 403);
  return next();
};
