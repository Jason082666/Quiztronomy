import { createUser, validationUser } from "../models/user.js";

import errors from "../models/errorhandler.js";

export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  const pass = await validationUser(email, password);
  if (pass === undefined) return new errors.CustomError("Email not found", 403);
  if (!pass) return new errors.CustomError("Validation fail", 403);
  const normObject = pass.toObject();
  const userId = normObject._id;
  const name = normObject.name;
  const user = { userId, name };
  req.session.user = user;
  return res.json({ data: pass });
};

export const userSignup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const data = await createUser(name, email, password);
    const normObj = data.toObject();
    const userId = normObj._id;
    const userName = normObj.name;
    const user = { userId, name: userName };
    req.session.user = user;
    return res.json({ data });
  } catch (e) {
    return new errors.CustomError("Sign up fail", 500);
  }
};

export const userLogout = async (req, res) => {
  req.session.destroy();
  return res.json({ data: "log out seccess" });
};
