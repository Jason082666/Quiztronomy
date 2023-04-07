import { client } from "./elasticsearch.js";
import { MyQizzPopularity } from "./mongodb.js";
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

// searchQuestionText(process.argv[2], process.argv[3]).then(console.log);

export const addPopIntoMongo = async function (id, popularity) {
  const myDoc = new MyQizzPopularity({ id, popularity });
  const result = await myDoc.save();
  return result;
};

export const selectHistoryPopById = async function (id) {
  const [result] = await MyQizzPopularity.aggregate([
    {
      $match: {
        id,
      },
    },
    {
      $group: {
        _id: null,
        totalPopularity: { $sum: "$popularity" },
      },
    },
  ]);
  if (!result) return undefined;
  return +result.totalPopularity;
};

export const selectLastUpdateById = async function (id) {
  const result = await MyQizzPopularity.findOne({ id }, { date: 1 }).sort({
    date: -1,
  });
  return result.date;
};

export const findDocumentById = async function (id) {
  const document = await MyQizzPopularity.findOne({ id });
  if (document) {
    return document;
  } else {
    return undefined;
  }
};

export const updateNewPopById = async function (id, num) {
  const historyPop = await selectHistoryPopById(id);
  const currentPop = historyPop + num;
  const lastUpdate = await selectLastUpdateById(id);
  const newPop = calculatePopularity(currentPop, historyPop, lastUpdate);
  const response = await client.update({
    index: "questiontext",
    id,
    body: {
      doc: {
        popularity: newPop,
      },
    },
  });
  await client.indices.refresh({ index: "questiontext" });
  return response;
};
