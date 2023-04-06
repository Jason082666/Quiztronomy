import { generateQuestionByAI } from "../models/openai.js";
import errors from "../models/errorhandler.js";
//TODO:  MANUAL 的待補
export const generateQuestionByPlayer = async (req, res, next) => {
  if (!req.body.q || !req.body.mode || !req.body.type)
    return next(new errors.ParameterError(["q", "mode", "type"], 400));
  if (!["AI", "MANUAL"].includes(req.body.mode))
    return next(
      new errors.CustomError(
        "Wrong create mode, should be 'AI' or 'MANUAL'",
        400
      )
    );
  const { q, type, mode } = req.body;
  if (mode === "AI") {
    const question = await generateQuestionByAI(q, type);
    question.type = type;
    question.popularity = 0;
    req.question = question;
    next();
  }
};
