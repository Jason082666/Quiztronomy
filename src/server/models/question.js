import { client } from "./elasticsearch.js";
import { calculatePopularity } from "./gaussain.js";
export const searchCertainId = async function (id) {
  const body = await client.get({
    index: "questiontext",
    id,
  });
  const object = body._source;
  object.id = id;
  return object;
};

export const insertQuestionIntoES = async function (body) {
  const addIntoResponse = await client.index({
    index: "questiontext",
    body,
  });
  await client.indices.refresh({ index: "questiontext" });
  if (addIntoResponse.errors) {
    console.error("存入 Elasticsearch 發生錯誤：", addIntoResponse.errors);
  }
  const result = await searchCertainId(addIntoResponse._id);
  return result;
};

export const searchQuestionText = async function (text, type) {
  const body = await client.search({
    index: "questiontext",
    body: {
      query: {
        bool: {
          must: [
            {
              match: {
                type: {
                  query: type,
                  operator: "and",
                },
              },
            },
            {
              function_score: {
                query: {
                  match: {
                    question: {
                      query: text,
                      fuzziness: "AUTO",
                    },
                  },
                },
                functions: [
                  {
                    weight: 0.5,
                    filter: {
                      match: {
                        question: {
                          query: text,
                          fuzziness: "AUTO",
                        },
                      },
                    },
                  },
                  {
                    weight: 0.5,
                    field_value_factor: {
                      field: "popularity",
                      factor: 1,
                      modifier: "log1p",
                    },
                  },
                ],
                score_mode: "sum",
                boost_mode: "multiply",
              },
            },
          ],
        },
      },
      sort: [{ _score: { order: "desc" } }, { popularity: { order: "desc" } }],
    },
  });
  const hits = body.hits.hits;
  return hits;
};

export const updateNewPopById = async function (id, num) {
  const result = await searchTimeAndPopById(id);
  const { timestamp, popularity } = result;
  const currentPop = popularity + num;
  const newPop = calculatePopularity(currentPop, popularity, timestamp);
  const response = await client.update({
    index: "questiontext",
    id,
    body: {
      doc: {
        popularity: newPop,
        timestamp: Date.now(),
      },
    },
  });
  await client.indices.refresh({ index: "questiontext" });
  return response;
};

export const searchTimeAndPopById = async function (id) {
  const response = await client.get({
    index: "questiontext",
    id: id,
  });
  const questionText = response._source;
  const timestamp = questionText.timestamp;
  const popularity = questionText.popularity;
  return { timestamp, popularity };
};
