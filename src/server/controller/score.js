import { addScore } from "../models/score.js";
import errors from "../../util/errorhandler.js";
export const addPlayerScore = async (req, res, next) => {
  const { roomId, score } = req.body;
  const { userId, name } = req.session.user;
  const playerObj = {};
  playerObj[userId] = name;

  if (!roomId || !score || !playerObj)
    return next(
      new errors.ParameterError(["roomId", "score", "playerObj"], 400)
    );
  const data = await addScore(roomId, score, playerObj);
  if (!data)
    return next(new errors.CustomError(`Add score on player failed`, 400));
  return res.json({
    message: `Add score on player success`,
    score: data,
  });
};
