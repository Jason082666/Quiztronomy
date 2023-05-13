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
    const result = await addScore("user-id", "user-name", mockPlayerObject);
    expect(result).toBe(false);
  });
  it("should return false when add score failed", async () => {
    const mockAddResult = false;
    jest.spyOn(redisClient, "exists").mockResolvedValue(true);
    jest.spyOn(redisClient, "zscore").mockResolvedValue(mockAddResult);
    jest.spyOn(redisClient, "zadd").mockResolvedValue(true);
    const result = await addScore("user-id", "user-name", mockPlayerObject);
    expect(result).toBe(false);
  });
  it("should return add result when add score succesfully", async () => {
    const mockAddResult = true;
    jest.spyOn(redisClient, "exists").mockResolvedValue(true);
    jest.spyOn(redisClient, "zscore").mockResolvedValue(mockAddResult);
    jest.spyOn(redisClient, "zadd").mockResolvedValue(true);
    const result = await addScore("user-id", "user-name", mockPlayerObject);
    expect(result).toBe(mockAddResult);
  });
});

describe("showRank", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  afterAll(async () => {
    await redisClient.quit();
  });
  it("should return array with user object ranked by their", async () => {
    jest.spyOn(redisClient, "zrevrange").mockResolvedValue(mockRankResult);
    const result = await showRank("room-id", 3);
    expect(result).toEqual(mockNewRankResult);
  });
});
