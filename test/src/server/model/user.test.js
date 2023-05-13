import {
  gameHostValidation,
  validationUser,
  createUser,
} from "../../../../src/server/models/user";
import { MyGameRoom, MyUser } from "../../../../src/server/models/mongoSchema";
import bcrypt from "bcrypt";
import { mockRoom, mockUser, mockSignup } from "./constant/user_data";

describe("gameHostValidation", () => {
  it("should return true when the room is found and founder details match", async () => {
    jest.spyOn(MyGameRoom, "findOne").mockResolvedValue(mockRoom);
    const result = await gameHostValidation("user-id", "user-name", "room-id");
    expect(result).toBe(true);
  });
  it("should return false when the room is not found", async () => {
    jest.spyOn(MyGameRoom, "findOne").mockResolvedValue(null);
    const result = await gameHostValidation("user-id", "user-name", "room-id");
    expect(result).toBe(false);
  });
});

describe("validationUser", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it("should return user object when the validation passed", async () => {
    jest.spyOn(MyUser, "findOne").mockResolvedValue(mockUser);
    const mockValidationResult = true;
    jest.spyOn(bcrypt, "compare").mockResolvedValue(mockValidationResult);
    const result = await validationUser("user-id", "user-name", "room-id");
    expect(result).toEqual(mockUser);
  });
  it("should return { error:'Email not found!'} when the email validation failed", async () => {
    jest.spyOn(MyUser, "findOne").mockResolvedValue(null);
    const mockValidationResult = true;
    jest.spyOn(bcrypt, "compare").mockResolvedValue(mockValidationResult);
    const result = await validationUser("user-email", "user-password");
    expect(result).toEqual({ error: "Email not found!" });
  });
  it("should return {error:'Validation failed !'} when the email validation passed but password validation failed", async () => {
    jest.spyOn(MyUser, "findOne").mockResolvedValue(mockUser);
    const mockValidationResult = false;
    jest.spyOn(bcrypt, "compare").mockResolvedValue(mockValidationResult);
    const result = await validationUser("user-email", "user-password");
    expect(result).toEqual({ error: "Validation failed !" });
  });
});

describe("createUser", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it("should create a new user with hashed password", async () => {
    jest.spyOn(bcrypt, "hash").mockResolvedValue(`hashed_${mockUser.password}`);
    jest.spyOn(MyUser, "create").mockResolvedValue({ mockSignup });
    const result = await createUser(
      mockSignup.name,
      mockSignup.email,
      mockSignup.password
    );
    expect(result).toEqual({
      mockSignup,
    });
  });
});
