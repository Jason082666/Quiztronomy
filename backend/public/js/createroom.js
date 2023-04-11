import { MultiChoice, TrueFalse } from "./question_module.js";
const roomId = localStorage.getItem("roomId");
const hostId = localStorage.getItem("hostId");
$("h1").text(`Room ID : ${roomId}`);

$("#finish-button").on("click", async () => {
  // 這邊到時候要把savetoquizzapi做好
  const roomId = localStorage.getItem("roomId");
  const object = { roomId, hostId };
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
      <input type="radio" name="question-type" class="MC-handy" id="single-choice" value="MC" />
      <label for="single-choice">單一選擇題</label>
      <input type="radio" id="true-false" class="TF-handy" name="question-type" value="TF" />
      <label for="true-false">是非題</label>
      <input
        type="radio" 
        id="multiple-choice"
        class="MCS-handy"
        name="question-type"
        value="MCS"
      />
      <label for="multiple-choice">多選題</label>
      <input type="radio" id="open-ended" class="QA-handy" name="question-type" value="QA" />
      <label for="open-ended">問答題</label>
      <br />
        <div class="quizz-handy-container">
        </div>
      `);
  }
});

$(".create-container").on("click", ".MC-handy", function () {
  $(".quizz-handy-container").html(`<div class="mcs-options">
  <label>輸入題目:</label>
  <input type="text" class="question-text">
  <label>A</label>
  <input type="radio" id="radioA" name="answer" value="A">
  <input type="text" id="optionA" name="optionA">
  <label>B</label>
  <input type="radio" id="radioB" name="answer" value="B">
  <input type="text" id="optionB" name="optionB">
  <label>C</label>
  <input type="radio" id="radioC" name="answer" value="C">
  <input type="text" id="optionC" name="optionC">
  <label>D</label>
  <input type="radio" id="radioD" name="answer" value="D">
  <input type="text" id="optionD" name="optionD">
  <label>答案解釋:</label>
  <textarea class= "explain-text"></textarea>
  <button type="submit" class="create-quizz-btn">確認送出</button>
</div>`);
});

$(".create-container").on("click", ".MCS-handy", function () {
  $(".quizz-handy-container").html(`<div class="mcs-options">
  <label>輸入題目:</label>
  <input type="text" class="question-text">
  <label>A</label>
  <input type="checkbox" id="checkA" name="checkA">
  <input type="text" id="optionA" name="optionA">
  <label>B</label>
  <input type="checkbox" id="checkB" name="checkB">
  <input type="text" id="optionB" name="optionB">
  <label>C</label>
  <input type="checkbox" id="checkC" name="checkC">
  <input type="text" id="optionC" name="optionC">
  <label>D</label>
  <input type="checkbox" id="checkD" name="checkD">
  <input type="text" id="optionD" name="optionD">
  <label>答案解釋:</label>
  <textarea class= "explain-text"></textarea>
  <button type="submit" class="create-quizz-btn">確認送出</button>
</div>`);
});

$(".create-container").on("click", ".TF-handy", function () {
  $(".quizz-handy-container").html(`<div class="tf-options">
  <label>輸入題目:</label>
  <input type="text" class="question-text">
  <label>True</label>
  <input type="radio" name="answer" value="true">
  <label>False</label>
  <input type="radio" name="answer" value="false">
  <br>
  <label>答案解釋:</label>
  <textarea class= "explain-text"></textarea>
  <button type="submit" class="create-quizz-btn">確認送出</button>
</div>`);
});

$(".create-container").on("click", ".QA-handy", function () {
  $(".quizz-handy-container").html(`<div class="qa-options">
  <label>輸入題目:</label>
  <input type="text" class="question-text">
  <label>答案:</label>
  <input type="text">
  <br>
  <label>答案解釋:</label>
  <textarea class= "explain-text"></textarea>
  <button type="submit" class="create-quizz-btn">確認送出</button>
</div>`);
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
