import { Router } from "express";
const router = Router();
import { catchError } from "../../util/catcherror.js";
import {
  searchRelatedQuizz,
  insertQuestionByPlayerIntoES,
  updateNewPop,
} from "../controller/question.js";
import {
  generateQuestionByPlayer,
  generateQuestionManually,
} from "../middleware/question.js";

router.route("/question/search").post(catchError(searchRelatedQuizz));
router
  .route("/question/create")
  .post(
    catchError(generateQuestionByPlayer),
    catchError(insertQuestionByPlayerIntoES)
  );
router
  .route("/question/createmanual")
  .post(
    catchError(generateQuestionManually),
    catchError(insertQuestionByPlayerIntoES)
  );

router.route("/question/update").post(catchError(updateNewPop));

export default router;
