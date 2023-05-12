import { Router } from "express";
const router = Router();
import { catchError } from "../../util/catcherror.js";
import { enterGameRoom, fastEnterGameRoom } from "../controller/game.js";
import { autheticationForPlaying } from "../middleware/authentication.js";
router
  .route("/game/room/:roomId")
  .get(catchError(autheticationForPlaying), catchError(enterGameRoom));
router.route("/game/fastenter/:roomId").get(catchError(fastEnterGameRoom));
export default router;
