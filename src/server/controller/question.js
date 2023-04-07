import {
  updateNewPopById,
  insertQuestionIntoES,
  searchQuestionText,
  searchQuestionSortByTime,
} from "../models/question.js";
import errors from "../models/errorhandler.js";

export const insertQuestionByPlayerIntoES = async (req, res, next) => {
  const { question } = req;
  const result = await insertQuestionIntoES(question);
  delete result.timestamp;
  delete result.popularity;
  res.json({ data: result });
};

// insertQuestionByPlayerIntoES().then(console.log);

// TODO: 當使用者點即由系統提供的題目時觸發，之後再轉成(res,req)的形式，或者可以交給queque做
export const updateNewPop = async (req, res, next) => {
  if (!req.body.id || !req.body.num)
    return next(new errors.ParameterError(["id", "num"], 400));
  const { id, num } = req.body;
  const result = await updateNewPopById(id, num);
  res.json({ result: result.result });
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
