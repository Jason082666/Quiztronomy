import { Router } from "express";
const router = Router();
import { catchError } from "../../util/catcherror.js";
import {
  authetication,
  autheticationForPlaying,
} from "../middleware/authentication.js";
import {
  createGameRoom,
  terminateGameRoom,
  checkRoomAvailability,
  saveQuizzIntoGameRoom,
  searchGameNameofGame,
  startGameRoom,
  createGameRoomOnRedis,
  checkDisconnection,
  findHostOnRedis,
} from "../controller/game.js";

router
  .route("/game/create")
  .post(catchError(authetication), catchError(createGameRoom));
router.route("/game/name").get(catchError(searchGameNameofGame));
router.route("/game/room").get(catchError(findHostOnRedis));
router.route("/game/disconnect").get(catchError(checkDisconnection));
router
  .route("/game/search")
  .post(catchError(autheticationForPlaying), catchError(checkRoomAvailability));
router
  .route("/game/start")
  .post(catchError(authetication), catchError(startGameRoom));
router.route("/game/terminate").post(catchError(terminateGameRoom));
router.route("/game/savequizz").post(catchError(saveQuizzIntoGameRoom));
router.route("/game/roomupdate").post(catchError(createGameRoomOnRedis));

export default router;
