import { Router } from "express";
const router = Router();
import { catchError } from "../../util/catcherror.js";
import {
  findUserHistory,
  findGameRoomData,
  findHostHistory,
  findTotalScoreAndGameOfUser,
} from "../controller/historydata.js";
router.route("/player/history").get(catchError(findUserHistory));
router.route("/game/history").get(catchError(findGameRoomData));
router.route("/host/history").get(catchError(findHostHistory));
router.route("/user/history").get(catchError(findTotalScoreAndGameOfUser));
export default router;
