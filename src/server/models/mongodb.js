import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

await mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.1luekd2.mongodb.net/${process.env.MONGO_DB_NAME}`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB Atlas", error);
  });

const MyGameRoomSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String },
  founder: {
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
  players: {
    id: { type: String },
  },

  roomStatus: { type: String, default: "preparing", required: true },
  date: { type: Date, default: Date.now },
  quizz: [
    // {
    //   question: { type: String },
    //   answer: [],
    //   explain: { type: String },
    //   type: { type: String },
    //   id: { type: String },
    // },
  ],
  score: [
    {
      id: { type: String },
      name: { type: String },
      score: { type: Number },
      rank: { type: Number },
    },
  ],
});

const MyUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  history: { type: Array, default: [] },
});

export const MyUser = mongoose.model("MyUser", MyUserSchema);
export const MyGameRoom = mongoose.model("MyGameRoom", MyGameRoomSchema);
