import { generateQuestionByAI } from "../models/openai.js";
import { model } from "../../util/openaimodel.js";
import errors from "../models/errorhandler.js";

//TODO:  MANUAL 的待補
export const generateQuestionByPlayer = async (req, res, next) => {
  if (!req.body.q || !req.body.type || !req.body.mode)
    return next(new errors.ParameterError(["q", "type", "mode"], 400));
  if (!model[req.body.type])
    return next(new CustomError("Wrong question type", 400));
  if (!["AI", "MANUAL"].includes(req.body.mode))
    return next(new CustomError("Wrong create mode", 400));
  const { q, type, mode } = req.body;
  if (mode === "AI") {
    const question = await generateQuestionByAI(q, type);
    question.type = model[type];
    question.popularity = 0;
    req.question = question;
    next();
  }
};
