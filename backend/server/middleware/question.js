import { generateQuestionByAI } from "../models/openai.js";
import errors from "../models/errorhandler.js";
//TODO:  MANUAL 的待補
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
  const { question, option, answer, explain, type } = req.body;
  // question: string,
  // option: object, ex {A:"123",B:"456",C:"789",D:"222"}  (就算是是非題問答題也要)
  // answer: array, ex {[true] or ["A","B","C"] or ["B"] or ["答案是我"] (問答題)}
  // explain: string
  // type: string ex: "MC-EN"
  if (!question || !option || !answer || !explain || !type)
    return next(
      new errors.ParameterError(
        ["question", "option", "answer", "explain", "type"],
        400
      )
    );
  const object = {
    question,
    option,
    answer,
    explain,
    type,
    popularity: 2,
    timestamp: Date.now(),
    createTime: Date.now(),
  };
  req.question = object;
  next();
};
