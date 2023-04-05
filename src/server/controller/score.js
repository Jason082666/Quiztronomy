import {
  addScore,
  showRank,
  addToQuequeAndUpdateMongo,
} from "../models/score.js";
import errors from "../models/errorhandler.js";
export const addPlayerScore = async (req, res, next) => {
  const { roomId, score, object } = req.body;
  if (!roomId || !score || !object)
    return next(new errors.ParameterError(["roomId", "score", "object"], 400));
  const data = await addScore(roomId, score, object);
  if (!data)
    return next(
      new errors.CustomError(`Add score on player ${object.id} failed`, 400)
    );
  return res.json({
    message: `Add score on player ${object.id} success`,
    score: data,
  });
};

export const showPlayerRank = async (req, res, next) => {
  const { roomId, ranknum } = req.query;
  if (!roomId || !ranknum)
    return next(new errors.ParameterError(["roomId", "ranknum"], 400));
  const data = await showRank(roomId, ranknum);
  if (!data[0]) return next(new errors.CustomError("Search failed", 400));
  return res.json({ data });
};

export const addSaveScoreTaskToQueque = async (req, res, next) => {
  const { roomId } = req.body;
  if (!roomId) return next(new errors.ParameterError(["roomId"], 400));
  const result = await addToQuequeAndUpdateMongo(roomId);
  if (result === null)
    return next(new errors.CustomError(`Room ${roomId} is not existed`, 400));
  if (!result)
    return next(new errors.CustomError(`Add ${roomId} to queque failed`, 500));
  return res.json({ message: `Add room data ${roomId} to queque` });
};
