import { redisClient } from "../src/util/cacheConnection.js";
import { sendOnlyEmail } from "simplesend";
import dotenv from "dotenv";
import path from "path";
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", "src", ".env") });

const funct = async () => {
  while (redisClient.status !== "reconnecting") {
    const object = await redisClient.brpop("error", 1);
    if (object) {
      errordata = JSON.parse(object[1]);
      const body = {
        user_id: process.env.MY_SIMPLESEND_USER_ID,
        nameFrom: process.env.MY_SIMPLESEND_REGISTERED_EMAIL,
        emailTo: process.env.MY_SIMPLESEND_EMAIL_DESTINATION,
        emailSubject: `Quiztronomy-worker-failed`,
        emailBodyType: "text",
        emailBodyContent: `falied to execute ${errordata}`,
        trackingOpen: "yes",
        trackingClick: "yes",
      };
      const apiKey = process.env.MY_SIMPLESEND_API_KEY;
      sendOnlyEmail(body, apiKey);
    }
  }
};

funct();
