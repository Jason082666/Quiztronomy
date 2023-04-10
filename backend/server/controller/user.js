import { createUser, validationUser } from "../models/user.js";

import errors from "../models/errorhandler.js";

export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  const pass = await validationUser(email, password);
  if (pass === undefined) return new errors.CustomError("Email not found", 403);
  if (!pass) return new errors.CustomError("Validation fail", 403);
  const normObject = pass.toObject();
  const userId = normObject._id;
  req.session.userId = userId;
  req.session.name = pass.name;
  res.cookie("connect.sid", req.sessionID);
  return res.json({ data: pass });
};

export const userSignup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const data = await createUser(name, email, password);
    const normObj = data.toObject();
    const userId = normObj._id;
    req.session.userId = userId;
    req.session.name = data.name;
    res.cookie("connect.sid", req.sessionID);
    return res.json({ data });
  } catch (e) {
    return new errors.CustomError("Sign up fail", 500);
  }
};
