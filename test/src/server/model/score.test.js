import {
  addScore,
  showRank,
  addToQueueAndUpdateMongo,
} from "../../../../src/server/models/score";
import { MyGameRoom } from "../../../../src/server/models/mongoSchema";
import { redisClient } from "../../../../src/util/cacheConnection";
import {
  mockPlayerObject,
  mockRankResult,
  mockNewRankResult,
} from "./constant/score_data";
import { beforeEach } from "node:test";

describe("addScore", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it("should return false when game room does not exist", async () => {
    const mockAddResult = true;
    jest.spyOn(redisClient, "exists").mockResolvedValue(false);
    jest.spyOn(redisClient, "zscore").mockResolvedValue(mockAddResult);
    jest.spyOn(redisClient, "zadd").mockResolvedValue(true);
    const result = await addScore("userId", "userName", mockPlayerObject);
    expect(result).toBe(false);
  });
  it("should return false when add score failed", async () => {
    const mockAddResult = false;
    jest.spyOn(redisClient, "exists").mockResolvedValue(true);
    jest.spyOn(redisClient, "zscore").mockResolvedValue(mockAddResult);
    jest.spyOn(redisClient, "zadd").mockResolvedValue(true);
    const result = await addScore("userId", "userName", mockPlayerObject);
    expect(result).toBe(false);
  });
  it("should return add result when add score succesfully", async () => {
    const mockAddResult = true;
    jest.spyOn(redisClient, "exists").mockResolvedValue(true);
    jest.spyOn(redisClient, "zscore").mockResolvedValue(mockAddResult);
    jest.spyOn(redisClient, "zadd").mockResolvedValue(true);
    const result = await addScore("userId", "userName", mockPlayerObject);
    expect(result).toBe(mockAddResult);
  });
});

describe("showRank", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it("should return array with user object ranked by their", async () => {
    jest.spyOn(redisClient, "zrevrange").mockResolvedValue(mockRankResult);
    const result = await showRank("roomId", 3);
    expect(result).toEqual(mockNewRankResult);
  });
});

describe("addToQueueAndUpdateMongo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should return false if game room does not exist", async () => {
    const gameRoom = null;
    jest.spyOn(MyGameRoom, "findOne").mockResolvedValue(gameRoom);
    const result = await addToQueueAndUpdateMongo("roomId");
    expect(result).toBe(false);
    jest.spyOn(redisClient, "del").mockResolvedValue(true);
    jest.spyOn(redisClient, "lpush").mockResolvedValue(true);
    expect(redisClient.del).not.toHaveBeenCalled();
    expect(redisClient.lpush).not.toHaveBeenCalled();
  });

  it("should update game room status and push to Redis if game room exists", async () => {
    const gameRoom = {
      _id: "uniqueId",
      id: "roomId",
      roomStatus: "started",
      save: jest.fn(),
    };
    jest.spyOn(redisClient, "del").mockResolvedValue(true);
    jest.spyOn(redisClient, "lpush").mockResolvedValue(true);
    jest.spyOn(MyGameRoom, "findOne").mockResolvedValue(gameRoom);
    const result = await addToQueueAndUpdateMongo("roomId");
    expect(result).toBe(true);
    expect(MyGameRoom.findOne).toHaveBeenCalledWith({
      id: "roomId",
      roomStatus: "started",
    });
    expect(gameRoom.roomStatus).toBe("closed");
    expect(gameRoom.save).toHaveBeenCalled();
    expect(redisClient.del).toHaveBeenCalledWith("roomId");
    expect(redisClient.lpush).toHaveBeenCalledWith(
      "saveScoreToMongo",
      JSON.stringify({ uniqueId: "uniqueId", roomId: "roomId" })
    );
  });
});
