import { Router } from "express";
const router = Router();
import { catchError } from "../../util/catcherror.js";
import {
  findUserHistory,
  findGameRoomData,
  findHostHistory,
  findTotalScoreAndGameOfUser,
} from "../controller/historydata.js";
import { authetication } from "../middleware/authentication.js";
router
  .route("/player/history")
  .get(catchError(authetication), catchError(findUserHistory));
router
  .route("/game/history")
  .get(catchError(authetication), catchError(findGameRoomData));
router
  .route("/host/history")
  .get(catchError(authetication), catchError(findHostHistory));
router
  .route("/user/history")
  .get(catchError(authetication), catchError(findTotalScoreAndGameOfUser));
export default router;
