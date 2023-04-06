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

// export const generateQuestion = async function (text, mode) {
//   try {
//     const openAIQuery = trainModel(text, +mode);
//     const completion = await openai.createChatCompletion({
//       model: "gpt-3.5-turbo",
//       messages: [
//         {
//           role: "user",
//           content: openAIQuery,
//         },
//       ],
//     });
//     console.log(completion.data.choices[0].message);
//     const content = completion.data.choices[0].message.content;
//     return JSON.parse(content);
//   } catch (error) {
//     if (error.response)
//       console.error(error.response.status, error.response.data);
//     else console.error(error.message);
//     return generateQuestion(text);
//   }
// };

export const generateQuestionByAI = async function (text, mode) {
  const TIMEOUT = 20000;

  let timer;
  const timeoutPromise = new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      console.log("Please retry again");
      reject({ error: "Please retry again!" });
    }, TIMEOUT);
  });

  const openAIQuery = trainModel(text, mode);
  const completionPromise = openai
    .createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: openAIQuery,
        },
      ],
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

