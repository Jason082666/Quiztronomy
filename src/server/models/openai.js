import { Configuration, OpenAIApi } from "openai";
import { trainModel } from "../../util/openai_train.js";
import dotenv from "dotenv";
import path from "path";
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const generateQuestionByAI = async function (text, type) {
  const TIMEOUT = 60000;

  let timer;
  const timeoutPromise = new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      console.error("Please retry again");
      reject({ error: "Please retry again!" });
    }, TIMEOUT);
  });

  const openAIQuery = trainModel(text, type);
  const completionPromise = openai
    .createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant to generate quiz for me.",
        },
        {
          role: "user",
          content: openAIQuery,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    })
    .then((completion) => {
      const content = completion.data.choices[0].message.content;
      return JSON.parse(content);
    });

  try {
    return await Promise.race([completionPromise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
};
