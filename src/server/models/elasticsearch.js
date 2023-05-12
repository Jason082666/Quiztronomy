import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";
import path from "path";
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

import { chstopWordsAarray, enstopWordsAarray } from "../../util/stopwords.js";
export const client = new Client({
  node: process.env.MY_ELASTICSEARCH_IP,
});

const createQuestionText = async function () {
  await client.indices.delete({
    index: "questiontext",
    ignore_unavailable: true,
  });
  await client.indices.create({
    index: "questiontext",
    body: {
      mappings: {
        properties: {
          type: {
            type: "text",
          },
          question: {
            type: "text",
            fields: {
              english: {
                type: "text",
                analyzer: "english_analyzer",
              },
              chinese: {
                type: "text",
                analyzer: "chinese_analyzer",
              },
            },
          },
          option: {
            type: "nested",
            properties: {
              question: {
                type: "text",
              },
              questiontext: {
                type: "text",
              },
            },
          },
          answer: {
            type: "keyword",
          },
          explain: {
            type: "text",
          },
          popularity: {
            type: "float",
          },
          timestamp: {
            type: "date",
            format: "epoch_millis",
          },
          createTime: {
            type: "date",
            format: "epoch_millis",
          },
        },
      },
      settings: {
        analysis: {
          char_filter: {
            stconvert: {
              type: "stconvert",
              delimiter: "#",
              keep_both: false,
              convert_type: "t2s",
            },
          },
          tokenizer: {
            ik_smart: {
              type: "ik_smart",
            },
          },
          filter: {
            stconvert: {
              type: "stconvert",
              delimiter: "#",
              keep_both: false,
              convert_type: "s2t",
            },
            edge_ngram_filter: {
              type: "edge_ngram",
              min_gram: 3,
              max_gram: 15,
            },
            ch_stopwords: {
              type: "stop",
              stopwords: chstopWordsAarray,
            },
            en_stopwords: {
              type: "stop",
              stopwords: enstopWordsAarray,
            },
          },

          analyzer: {
            chinese_analyzer: {
              type: "custom",
              char_filter: ["stconvert"],
              tokenizer: "ik_smart",
              filter: ["ch_stopwords", "stconvert"],
            },
            english_analyzer: {
              tokenizer: "whitespace",
              filter: ["en_stopwords", "lowercase", "edge_ngram_filter"],
            },
          },
        },
      },
    },
  });
};

// createQuestionText();
