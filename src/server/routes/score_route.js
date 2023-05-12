import { Router } from "express";
import {
  // authetication,
  autheticationForPlaying,
} from "../middleware/authentication.js";
const router = Router();
import { catchError } from "../../util/catcherror.js";
import { addPlayerScore } from "../controller/score.js";

router
  .route("/score/add")
  .put(catchError(autheticationForPlaying), catchError(addPlayerScore));

export default router;
