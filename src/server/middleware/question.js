import { generateQuestionByAI } from "../models/openai.js";
import errors from "../models/errorhandler.js";
export const generateQuestionByPlayer = async (req, res, next) => {
  if (!req.body.q || !req.body.type)
    return next(new errors.ParameterError(["q", "type"], 400));
  const { q, type } = req.body;
  const question = await generateQuestionByAI(q, type);
  question.type = type;
  question.timestamp = Date.now();
  question.createTime = Date.now();
  question.popularity = 2;
  req.question = question;
  next();
};
export const generateQuestionManually = async (req, res, next) => {
  const { question, options, answer, explain, type } = req.body;
  if (["TF-CH", "TF-EN"].includes(type)) {
    if (!question || !answer || !explain || !type)
      return next(
        new errors.ParameterError(
          ["question", "answer", "explain", "type"],
          400
        )
      );
    const object = {
      question,
      answer,
      explain,
      type,
      popularity: 2,
      timestamp: Date.now(),
      createTime: Date.now(),
    };
    req.question = object;
    return next();
  }
  if (!question || !answer || !options || !explain || !type)
    return next(
      new errors.ParameterError(
        ["question", "answer", "options", "explain", "type"],
        400
      )
    );
  const object = {
    question,
    answer,
    options,
    explain,
    type,
    popularity: 2,
    timestamp: Date.now(),
    createTime: Date.now(),
  };
  req.question = object;
  return next();
};
