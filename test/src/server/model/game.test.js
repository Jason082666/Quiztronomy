import {
  gameRoomExistence,
  searchGameName,
  playerDisconnect,
  checkDisconnectList,
  saveQuizIntoRoom,
  checkRoomStatus,
  enterRedisRoom,
  enterRoom,
} from "../../../../src/server/models/game";
import {
  mockGameRoom,
  mock40Quizzes,
  mock41Quizzes,
} from "./constant/game_data";
import { MyGameRoom } from "../../../../src/server/models/mongoSchema";
import { redisClient } from "../../../../src/util/cacheConnection";
jest.mock("../../../../src/util/cacheConnection", () => ({
  redisClient: {
    exists: jest.fn(),
    hset: jest.fn(),
    hexists: jest.fn(),
    hdel: jest.fn(),
    hget: jest.fn(),
    rpush: jest.fn(),
    zincrby: jest.fn(),
  },
}));

describe("gameRoomExistence", () => {
  it("should return true when room exists", async () => {
    jest.spyOn(MyGameRoom, "findOne").mockResolvedValue(mockGameRoom);
    const result = await gameRoomExistence("roomId");
    expect(result).toBe(true);
  });
  it("should return false when room dosen't exist", async () => {
    jest.spyOn(MyGameRoom, "findOne").mockResolvedValue(null);
    const result = await gameRoomExistence("roomId");
    expect(result).toBe(false);
  });
});

describe("searchGameName", () => {
  it("should return empty string when game is not found", async () => {
    jest.spyOn(MyGameRoom, "findOne").mockResolvedValue(null);
    const result = await searchGameName("roomId");
    expect(result).toBe("");
  });
  it("should return game name when game is found", async () => {
    jest.spyOn(MyGameRoom, "findOne").mockResolvedValue(mockGameRoom);
    const result = await searchGameName("roomId");
    expect(result).toBe(mockGameRoom.name);
  });
});

describe("playerDisconnect", () => {
  it("should return false when room for disconnect players dosen't exist", async () => {
    jest.spyOn(redisClient, "exists").mockResolvedValue(0);
    jest.spyOn(redisClient, "hset").mockResolvedValue(1);
    const result = await playerDisconnect("roomId", "userId", "name");
    expect(redisClient.exists).toHaveBeenCalled();
    expect(redisClient.hset).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });
  it("should return 1 when room for disconnect players exists", async () => {
    jest.spyOn(redisClient, "exists").mockResolvedValue(1);
    jest.spyOn(redisClient, "hset").mockResolvedValue(1);
    const result = await playerDisconnect("roomId", "userId", "name");
    expect(redisClient.exists).toHaveBeenCalled();
    expect(redisClient.hset).toHaveBeenCalled();
    expect(result).toBe(1);
  });
});

describe("checkDisconnectList", () => {
  it("should return false when player is not in disconnect room", async () => {
    jest.spyOn(redisClient, "hexists").mockResolvedValue(0);
    jest.spyOn(redisClient, "hdel").mockResolvedValue(1);
    const result = await checkDisconnectList("roomId", "userId");
    expect(redisClient.hexists).toHaveBeenCalled();
    expect(redisClient.hdel).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });
  it("should return true when player is in the disconnect room", async () => {
    jest.spyOn(redisClient, "hexists").mockResolvedValue(1);
    jest.spyOn(redisClient, "hdel").mockResolvedValue(1);
    const result = await checkDisconnectList("roomId", "userId");
    expect(redisClient.hexists).toHaveBeenCalled();
    expect(redisClient.hdel).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});

describe("saveQuizIntoRoom", () => {
  it("should return false when quiz number is more than 40", async () => {
    jest.spyOn(MyGameRoom, "findOne").mockResolvedValue(mockGameRoom);
    jest.spyOn(redisClient, "rpush").mockResolvedValue(1);
    const result = await saveQuizIntoRoom(mock41Quizzes, "roomId", "founderId");
    expect(MyGameRoom.findOne).toHaveBeenCalled();
    expect(redisClient.rpush).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });
  it("should return true when quiz number is less than 40", async () => {
    jest.spyOn(MyGameRoom, "findOne").mockResolvedValue(mockGameRoom);
    jest.spyOn(redisClient, "rpush").mockResolvedValue(1);
    const result = await saveQuizIntoRoom(mock40Quizzes, "roomId", "founderId");
    expect(MyGameRoom.findOne).toHaveBeenCalled();
    expect(redisClient.rpush).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});

describe("checkRoomStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should return false when room doesn't exist", async () => {
    jest.spyOn(redisClient, "exists").mockResolvedValue(0);
    jest.spyOn(redisClient, "hget").mockResolvedValue(1);
    const result = await checkRoomStatus("roomId");
    expect(redisClient.hget).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });
  it("should return false when room status is not 'prepared'", async () => {
    jest.spyOn(redisClient, "exists").mockResolvedValue(1);
    jest.spyOn(redisClient, "hget").mockImplementation(async (key, field) => {
      if (field === "status") return "not-prepared";
      if (field === "host") return "hostId";
    });
    const result = await checkRoomStatus("roomId", "id");
    expect(redisClient.exists).toHaveBeenCalled();
    expect(redisClient.hget).toHaveBeenCalledWith("roomId-room", "status");
    expect(result).toBe(false);
  });

  it("should return false when current player is the host in 'prepared' status", async () => {
    jest.spyOn(redisClient, "exists").mockResolvedValue(1);
    jest.spyOn(redisClient, "hget").mockImplementation(async (key, field) => {
      if (field === "status") return "prepared";
      if (field === "host") return "id";
    });
    const result = await checkRoomStatus("roomId", "id");
    expect(redisClient.exists).toHaveBeenCalled();
    expect(redisClient.hget).toHaveBeenCalledWith("roomId-room", "status");
    expect(redisClient.hget).toHaveBeenCalledWith("roomId-room", "host");
    expect(result).toBe(false);
  });

  it("should return true when room status is 'prepared' and current player is not the host", async () => {
    jest.spyOn(redisClient, "exists").mockResolvedValue(1);
    jest.spyOn(redisClient, "hget").mockImplementation(async (key, field) => {
      if (field === "status") return "prepared";
      if (field === "host") return "hostId";
    });
    const result = await checkRoomStatus("roomId", "playerId");
    expect(redisClient.exists).toHaveBeenCalled();
    expect(redisClient.hget).toHaveBeenCalledWith("roomId-room", "status");
    expect(redisClient.hget).toHaveBeenCalledWith("roomId-room", "host");
    expect(result).toBe(true);
  });
});

describe("enterRedisRoom", () => {
  it("should return false when failed to enter room", async () => {
    jest.spyOn(redisClient, "hset").mockResolvedValue(0);
    const result = await enterRedisRoom("roomId", "id", "name");
    expect(redisClient.hset).toHaveBeenCalled();
    expect(result).toBe(false);
  });
  it("should return true when enter the room", async () => {
    jest.spyOn(redisClient, "hset").mockResolvedValue(1);
    const result = await enterRedisRoom("roomId", "id", "name");
    expect(redisClient.hset).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});

describe("enterRoom", () => {
  it("should return false when room doesn't exist", async () => {
    jest.spyOn(redisClient, "exists").mockResolvedValue(0);
    jest.spyOn(redisClient, "zincrby").mockResolvedValue(1);
    const result = await enterRoom("roomId", "id");
    expect(redisClient.exists).toHaveBeenCalled();
    expect(redisClient.zincrby).toHaveBeenCalled();
    expect(result).toBe(false);
  });
  it("should return false when enter times > 1", async () => {
    jest.spyOn(redisClient, "exists").mockResolvedValue(1);
    jest.spyOn(redisClient, "zincrby").mockResolvedValue(2);
    const result = await enterRoom("roomId", "id");
    expect(redisClient.exists).toHaveBeenCalled();
    expect(redisClient.zincrby).toHaveBeenCalled();
    expect(result).toBe(false);
  });
  it("should return true when enter times <= 1 and room exists", async () => {
    jest.spyOn(redisClient, "exists").mockResolvedValue(1);
    jest.spyOn(redisClient, "zincrby").mockResolvedValue(1);
    const result = await enterRoom("roomId", "id");
    expect(redisClient.exists).toHaveBeenCalled();
    expect(redisClient.zincrby).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
