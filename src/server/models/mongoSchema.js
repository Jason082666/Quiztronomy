import mongoose from "mongoose";
const MyGameRoomSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String },
  founder: {
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
  roomStatus: { type: String, default: "preparing", required: true },
  date: { type: Date, default: Date.now },
  quiz: [
    {
      question: { type: String },
      answer: [],
      options: {},
      explain: { type: String },
      type: { type: String },
      id: { type: String },
    },
  ],
  score: [
    {
      id: { type: String },
      name: { type: String },
      score: { type: Number },
      rank: { type: Number },
    },
  ],
  history: { type: Array, default: [] },
});

const MyUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  totalGame: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  history: { type: Array, default: [] },
  hostHistory: { type: Array, default: [] },
});

export const MyUser = mongoose.model("MyUser", MyUserSchema);
export const MyGameRoom = mongoose.model("MyGameRoom", MyGameRoomSchema);
