import axios from "axios";
import { enCSSTerm, chCSSTerm } from "./quizterm.js";
const fetchResult = await axios.get(
  "https://random-word-api.herokuapp.com/word"
);
const feedWord = fetchResult.data[0];

const autogenerateQuiz = async (q, type) => {
  axios.post("https://quiztronomy.xyz/api/1.0/question/create", { q, type });
};

const typeArray = ["MC-EN", "MC-CH", "MCS-EN", "MCS-CH", "TF-EN", "TF-CH"];

async function generateENQuizzesWithDelay() {
  for (let i of enCSSTerm) {
    await autogenerateQuiz(i, typeArray[0]);
    await autogenerateQuiz(i, typeArray[1]);
    await autogenerateQuiz(i, typeArray[2]);
    await autogenerateQuiz(i, typeArray[3]);
    await autogenerateQuiz(i, typeArray[4]);
    await autogenerateQuiz(i, typeArray[5]);
    await delay(1000);
  }
}
async function generateCHQuizzesWithDelay() {
  for (let i of enCSSTerm) {
    await autogenerateQuiz(i, typeArray[1]);
    await autogenerateQuiz(i, typeArray[3]);
    await autogenerateQuiz(i, typeArray[5]);
    await delay(1000);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

generateENQuizzesWithDelay();
// generateCHQuizzesWithDelay();
