import { Client } from "@elastic/elasticsearch";
import { chstopWordsAarray, enstopWordsAarray } from "../../util/stopwords.js";
export const client = new Client({
  node: "http://localhost:9200",
  auth: {
    username: "elastic",
    password: "QP9Ze31YCEoo5XgjryQA",
  },
});

const createQuestionText = async function () {
  try {
    await client.indices.delete({
      index: "question",
      ignore_unavailable: true,
    });
    const response = await client.indices.create({
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
  } catch (e) {
    console.error("error from [function]: createQuestionText", e);
  }
};

// await createQuestionText();
