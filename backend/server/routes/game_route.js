import { Router } from "express";
const router = Router();
import { catchError } from "../../util/catcherror.js";
import {
  createGameRoom,
  enterGameRoom,
  leaveGameRoom,
  terminateGameRoom,
  saveQuizzIntoGameRoom,
  getCurrentQuizz,
  startGameRoom,
  createGameRoomOnRedis,
} from "../controller/game.js";

router.route("/game/currentquizz").get(catchError(getCurrentQuizz));
router.route("/game/create").post(catchError(createGameRoom));
router.route("/game/enter").post(catchError(enterGameRoom));
router.route("/game/leave").post(catchError(leaveGameRoom));
router.route("/game/start").post(catchError(startGameRoom));
router.route("/game/terminate").post(catchError(terminateGameRoom));
router.route("/game/savequizz").post(catchError(saveQuizzIntoGameRoom));
router.route("/game/roomupdate").post(catchError(createGameRoomOnRedis));

export default router;