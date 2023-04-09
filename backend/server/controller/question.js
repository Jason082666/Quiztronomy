import {
  updateNewPopById,
  insertQuestionIntoES,
  searchQuestionText,
  searchQuestionSortByTime,
  updatePopToQueque,
} from "../models/question.js";
import errors from "../models/errorhandler.js";

export const insertQuestionByPlayerIntoES = async (req, res, next) => {
  const { question } = req;
  const result = await insertQuestionIntoES(question);
  delete result.timestamp;
  delete result.popularity;
  res.json({ data: result });
};

export const updateNewPop = async (req, res, next) => {
  if (!req.body.object) return next(new errors.ParameterError(["object"], 400));
  const { object } = req.body;
  const result = await updatePopToQueque(object);
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
  const result = await searchQuestionText(q, type, excludeIds);
  const num = 5 - +result.length;
  const resultByTime = await searchQuestionSortByTime(q, type, excludeIds, num);
  const resultArray = [...result, ...resultByTime];
  const uniqueResults = resultArray.filter((item, index) => {
    return resultArray.findIndex((other) => other.id === item.id) === index;
  });
  res.json({ data: uniqueResults });
};
