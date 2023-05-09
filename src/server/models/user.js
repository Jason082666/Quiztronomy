import { MyUser, MyGameRoom } from "./mongodb.js";
import dotenv from "dotenv";
import path from "path";
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });
import bcrypt from "bcrypt";

export const createUser = async function (name, email, password) {
  const SALTROUNDS = +process.env.SALTROUNDS;
  const hash = await bcrypt.hash(password, SALTROUNDS);
  const userData = { name, email, password: hash };
  const userInfo = await MyUser.create(userData);
  return userInfo;
};
export const validationUser = async function (email, password) {
  const user = await MyUser.findOne({
    email,
  });
  if (!user) return undefined;
  const validation = await bcrypt.compare(password, user.password);
  if (!validation) return false;
  return user;
};

export const gameHostValidation = async function (userId, userName, roomId) {
  const result = await MyGameRoom.findOne({
    id: roomId,
    "founder.id": userId,
    "founder.name": userName,
  });
  if (!result) return false;
  return true;
};
