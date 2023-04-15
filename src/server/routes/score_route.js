import { Router } from "express";
import { authetication } from "../middleware/authentication.js";
const router = Router();
import { catchError } from "../../util/catcherror.js";
import {
  addPlayerScore,
  showPlayerRank,
  addSaveScoreTaskToQueque,
} from "../controller/score.js";

router
  .route("/score/add")
  .post(catchError(authetication), catchError(addPlayerScore));
router.route("/score/search").get(catchError(showPlayerRank));
router.route("/score/queque").post(catchError(addSaveScoreTaskToQueque));

export default router;
