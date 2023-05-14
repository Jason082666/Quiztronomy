import { createRoom } from "../../../src/server/models/game";
import { createGameRoom } from "../../../src/server/controller/game";
import { ParameterError } from "../../../src/util/errorhandler";
import { redisClient } from "../../../src/util/cacheConnection";
jest.mock("../../../src/server/models/game");
jest.mock("../../../src/util/errorhandler", () => {
  return {
    ParameterError: jest.fn().mockImplementation((params, statusCode) => {
      return {
        params,
        statusCode,
      };
    }),
  };
});

describe("createGameRoom", () => {
  let req, res, next;
  beforeEach(() => {
    req = {
      session: {
        user: {
          userId: "user1",
          name: "John",
        },
      },
      body: {
        gameRoomName: "Room1",
      },
    };
    res = {
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should create a game room and send the response", async () => {
    createRoom.mockResolvedValue("gameRoomId");

    await createGameRoom(req, res, next);

    expect(createRoom).toHaveBeenCalledWith(
      req.session.user.userId,
      req.session.user.name,
      req.body.gameRoomName
    );
    expect(res.json).toHaveBeenCalledWith({ data: "gameRoomId" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should handle missing parameters and call the next middleware with an error", async () => {
    req.session.user.userId = null;
    await createGameRoom(req, res, next);
    expect(next).toHaveBeenCalledWith(
      new ParameterError(["userId", "name", "gameRoomName"], 400)
    );
    expect(createRoom).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
