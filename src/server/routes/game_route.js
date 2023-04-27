import { Router } from "express";
const router = Router();
import { catchError } from "../../util/catcherror.js";
import {
  authetication,
  autheticationForPlaying,
} from "../middleware/authentication.js";
import {
  createGameRoom,
  // enterGameRoom,
  // leaveGameRoom,
  terminateGameRoom,
  checkRoomAvailability,
  saveQuizzIntoGameRoom,
  // getCurrentQuizz,
  startGameRoom,
  createGameRoomOnRedis,
  checkDisconnection,
} from "../controller/game.js";

// router.route("/game/currentquizz").get(catchError(getCurrentQuizz));
router
  .route("/game/create")
  .post(catchError(authetication), catchError(createGameRoom));

router.route("/game/disconnect").get(catchError(checkDisconnection));
// router
//   .route("/game/enter")
//   .post(catchError(autheticationForPlaying), catchError(enterGameRoom));
router
  .route("/game/search")
  .post(catchError(autheticationForPlaying), catchError(checkRoomAvailability));
// router
//   .route("/game/leave")
//   .post(catchError(authetication), catchError(leaveGameRoom));
router
  .route("/game/start")
  .post(catchError(authetication), catchError(startGameRoom));
router.route("/game/terminate").post(catchError(terminateGameRoom));
router.route("/game/savequizz").post(catchError(saveQuizzIntoGameRoom));
router.route("/game/roomupdate").post(catchError(createGameRoomOnRedis));

export default router;
