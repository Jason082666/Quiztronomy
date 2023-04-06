import { MultiChoice, TrueFalse } from "./question_module.js";
const roomId = localStorage.getItem("roomId");
$("h1").text(`Room ID : ${roomId}`);

$("#finish-button").on("click", async () => {
  // 這邊到時候要把savetoquizzapi做好
  const roomId = localStorage.getItem("roomId");
  const object = { roomId, status: "ready" };
  const result = await axios.post("/api/1.0/game/roomupdate", object);
  const { data } = result;
  if (data.error) return console.log(data.error);
  window.location.href = `/game/room/${roomId}`;
});

$("#create-by-system").on("change", function () {
  if ($(this).is(":checked")) {
    $(".create-container").empty();
    $(".create-container").html(`
        <label for="question-type">選擇題型：</label>
        <input type="radio" name="question-type" id="single-choice" value="MC" />
        <label for="single-choice">單一選擇題</label>
        <input type="radio" id="true-false" name="question-type" value="TF" />
        <label for="true-false">是非題</label>
        <input
          type="radio"
          id="multiple-choice"
          name="question-type"
          value="MCS"
        />
        <label for="multiple-choice">多選題</label>
        <div class="quizz">
          <label for="search-input">請搜尋題目：</label>
          <input type="text" id="search-input" />
          <button id="search-submit">搜尋</button>
          <button id="search-submit-by-ai">AI生成</button>
          <div class="content"></div>
          <button id="confirm-quizz">確認</button>
        </div>
      `);
  }
});

$("#create-by-hand").on("change", function () {
  if ($(this).is(":checked")) {
    $(".create-container").empty();
    $(".create-container").html(`
      <label for="question-type">選擇題型：</label>
      <input type="radio" name="question-type" id="single-choice" value="MC" />
      <label for="single-choice">單一選擇題</label>
      <input type="radio" id="true-false" name="question-type" value="TF" />
      <label for="true-false">是非題</label>
      <input
        type="radio" 
        id="multiple-choice"
        name="question-type"
        value="MCS"
      />
      <label for="multiple-choice">多選題</label>
      <input type="radio" id="open-ended" name="question-type" value="QA" />
      <label for="open-ended">問答題</label>
      <br />
        <div class="quizz">
          <label for="search-input">待補上</label>
          <input type="text" id="search-input" />
          <button type="submit" id="search-submit">提交</button>
        </div>
      `);
  }
});

$(".create-container").on("click", "#search-submit", function () {
  search();
});

$(".create-container").on("keydown", "#search-input", function (e) {
  if (e.keyCode == 13) {
    search();
  }
});

$(".create-container").on("click", "#search-submit-by-ai", async function () {
  const data = await searchByAI();
  console.log("data", data);
  if (["TF-CH", "TF-EN"].includes(data.type)) {
    const quizz = new TrueFalse(
      data.question,
      data.answer,
      data.explain,
      data.id
    );
    const html = quizz.html;
    $("#search-result").append(html);
  }
  if (["MC-CH", "MC-EN", "MCS-CH", "MCS-EN"].includes(data.type)) {
    const quizz = new MultiChoice(
      data.question,
      data.answer,
      data.explain,
      data.option,
      data.id
    );
    const html = quizz.html;
    $("#search-result").append(html);
  }
});

const search = async () => {
  const language = $("#search-language").val();
  const create = $("input[name='question-type']:checked").val();
  const type = `${create}-${language}`;
  const query = $("#search-input").val();
  const result = await axios.get(
    `/api/1.0/question/search?q=${query}&type=${type}`
  );
  const { data } = result.data;
  return data;
};

const searchByAI = async () => {
  const language = $("#search-language").val();
  const create = $("input[name='question-type']:checked").val();
  const type = `${create}-${language}`;
  const q = $("#search-input").val();
  const obj = { q, type, mode: "AI" };
  const result = await axios.post("/api/1.0/question/create", obj);
  const { data } = result.data;
  return data;
};
