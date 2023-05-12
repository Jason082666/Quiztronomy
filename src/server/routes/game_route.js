import { Router } from "express";
const router = Router();
import { catchError } from "../../util/catcherror.js";
import {
  authetication,
  autheticationForPlaying,
} from "../middleware/authentication.js";
import {
  createGameRoom,
  checkRoomAvailabilityAndEnter,
  saveQuizIntoGameRoom,
  searchGameNameofGame,
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
  .route("/game/entryPreparing")
  .post(
    catchError(autheticationForPlaying),
    catchError(checkRoomAvailabilityAndEnter)
  );
router.route("/game/quizes").post(catchError(saveQuizIntoGameRoom));
router.route("/game/update").post(catchError(createGameRoomOnRedis));

export default router;
