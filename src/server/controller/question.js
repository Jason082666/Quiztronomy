import {
  insertQuestionIntoES,
  searchQuestionText,
  searchQuestionSortByTime,
  updatePopToQueue,
} from "../models/question.js";
import errors from "../../util/errorhandler.js";

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
  await updatePopToQueue(popObj);
  res.json({ message: "success" });
};

export const searchRelatedQuiz = async (req, res, next) => {
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
