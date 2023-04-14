import { Router } from "express";
const router = Router();
import { catchError } from "../../util/catcherror.js";
import {
  addPlayerScore,
  showPlayerRank,
  addSaveScoreTaskToQueque,
} from "../controller/score.js";

router.route("/score/add").post(catchError(addPlayerScore));
router.route("/score/search").get(catchError(showPlayerRank));
router.route("/score/queque").post(catchError(addSaveScoreTaskToQueque));

export default router;
