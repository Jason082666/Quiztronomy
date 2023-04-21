import { Router } from "express";
const router = Router();
import { catchError } from "../../util/catcherror.js";
import {
  findUserHistory,
  findGameRoomData,
} from "../controller/historydata.js";
router.route("/user/history").get(catchError(findUserHistory));
router.route("/game/history").get(catchError(findGameRoomData));
export default router;
