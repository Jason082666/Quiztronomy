import {
  insertQuestionIntoES,
  searchQuestionText,
  searchQuestionSortByTime,
  updatePopToQueque,
} from "../models/question.js";
import errors from "../models/errorhandler.js";

export const insertQuestionByPlayerIntoES = async (req, res) => {
  const { question } = req;
  const result = await insertQuestionIntoES(question);
  delete result.timestamp;
  delete result.popularity;
  res.json({ data: result });
};

export const updateNewPop = async (req, res, next) => {
  if (!req.body.popObj) return next(new errors.ParameterError(["popObj"], 400));
  const { popObj } = req.body;
  const result = await updatePopToQueque(popObj);
  if (!result)
    return next(
      new errors.CustomError("Add to queque for updating pop failed", 400)
    );
  res.json({ message: "success" });
};

export const searchRelatedQuizz = async (req, res, next) => {
  if (!req.body.q || !req.body.type || !req.body.excludeIds)
    return next(new errors.ParameterError(["q", "type", "excludeIds"], 400));
  const { q, type, excludeIds } = req.body;
  const parseExcludeIds = JSON.parse(excludeIds);
  const result = await searchQuestionText(q, type, parseExcludeIds);
  const num = 5 - +result.length;
  const resultByTime = await searchQuestionSortByTime(
    q,
    type,
    parseExcludeIds,
    num
  );
  const resultArray = [...result, ...resultByTime];
  const uniqueResults = resultArray.filter((item, index) => {
    return resultArray.findIndex((other) => other.id === item.id) === index;
  });
  res.json({ data: uniqueResults });
};