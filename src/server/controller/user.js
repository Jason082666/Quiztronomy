import { createUser, validationUser } from "../models/user.js";
import errors from "../../util/errorhandler.js";
import { v4 as uuidv4 } from "uuid";
import { validationResult } from "express-validator";

export const userLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const check = await validationUser(email, password);
  if (check.error) return next(new errors.CustomError(check.error, 401));
  const normObject = check.toObject();
  const userId = normObject._id;
  const name = normObject.name;
  req.session.user = { userId, name };
  return res.json({ data: check });
};

export const visiterLogin = async (req, res) => {
  const { name } = req.body;
  const userId = uuidv4();
  const user = { userId, name, visitor: true };
  req.session.user = user;
  return res.json({ data: user });
};

export const userSignup = async (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const array = errors.errors;
    let warning = "";
    array.forEach((element) => {
      warning += ` ${element.msg}`;
    });
    const err = new Error(warning);
    err.statusCode = 400;
    return next(err);
  }
  try {
    const data = await createUser(name, email, password);
    const normObj = data.toObject();
    const userId = normObj._id;
    const userName = normObj.name;
    const user = { userId, name: userName };
    req.session.user = user;
    return res.json({ data });
  } catch (e) {
    const err = new Error("This email has been registered.");
    err.statusCode = 400;
    return next(err);
  }
};

export const userLogout = async (req, res) => {
  req.session.destroy();
  return res.json({ data: "log out seccess" });
};

export const userLoginStatus = async (req, res) => {
  if (!req.session.user || req.session.user.visitor)
    return res.json({ data: { error: "log in fail" } });
  const { userId, name } = req.session.user;
  return res.json({ data: { userId, name } });
};
