import { Router } from "express";
const router = Router();
import { catchError } from "../../util/catcherror.js";
import {
  searchRelatedQuizz,
  insertQuestionByPlayerIntoES,
  updateNewPoptoMongoAndES,
} from "../controller/question.js";
import { generateQuestionByPlayer } from "../middleware/question.js";

router.route("/question/search").get(catchError(searchRelatedQuizz));
router
  .route("/question/create")
  .post(
    catchError(generateQuestionByPlayer),
    catchError(insertQuestionByPlayerIntoES)
  );

router.route("/question/update").post(catchError(updateNewPoptoMongoAndES));

export default router;
