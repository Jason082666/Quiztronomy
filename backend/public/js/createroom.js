import { MultiChoice, TrueFalse } from "./question_module.js";
const roomId = localStorage.getItem("roomId");
const hostId = localStorage.getItem("hostId");
$("h1").text(`Room ID : ${roomId}`);
localStorage.setItem("searchedId", "[]");
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
    $("#search-result").show();
    $(".create-container").empty();
    $(".create-container").html(`
  <label class="label-for-question" for="question-type">選擇題型：</label>
  <input type="radio" name="question-type" id="single-choice" value="MC">
  <label class="label-for-question" for="single-choice">單一選擇題</label>
  <input type="radio" id="true-false" name="question-type" value="TF">
  <label class="label-for-question" for="true-false">是非題</label>
  <input type="radio" id="multiple-choice" name="question-type" value="MCS">
  <label class="label-for-question" for="multiple-choice">多選題</label>
  <div class="quizz">
    <label for="search-input">請搜尋題目：</label>
    <div class="search-container">
      <input type="text" id="search-input">
      <div id="search-submit"></div>
    </div>
    <div class="search-container">
      <div id="search-submit-by-ai-pic"></div>
      <button id="search-submit-by-ai"> AI 生成 </button>
    </div>
    <div class="content"></div>
  </div>`);
  }
});

$("#create-by-hand").on("change", function () {
  if ($(this).is(":checked")) {
    $("#search-result").hide();
    $(".create-container").empty();
    $(".create-container").html(`
      <label for="question-type">選擇題型：</label>
      <input type="radio" name="question-type" class="MC-handy" id="single-choice" value="MC" />
      <label class="label-for-question" for="single-choice">單一選擇題</label>
      <input type="radio" id="true-false" class="TF-handy" name="question-type" value="TF" />
      <label class="label-for-question" for="true-false">是非題</label>
      <input
        type="radio" 
        id="multiple-choice"
        class="MCS-handy"
        name="question-type"
        value="MCS"
      />
      <label class="label-for-question" for="multiple-choice">多選題</label>
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
  <input type="checkbox" id="checkA" name="answer" value="A">
  <input type="text" id="optionA" name="optionA">
  <label>B</label>
  <input type="checkbox" id="checkB" name="answer" value="B">
  <input type="text" id="optionB" name="optionB">
  <label>C</label>
  <input type="checkbox" id="checkC" name="answer" value="C">
  <input type="text" id="optionC" name="optionC">
  <label>D</label>
  <input type="checkbox" id="checkD" name="answer" value="D">
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

$(".create-container").on("click", "#search-submit", async function () {
  const quizzes = await search();
  if (!quizzes[0]) return;
  quizzes.forEach((quizz) => {
    const searched = JSON.parse(localStorage.getItem("searchedId"));
    if (["MC-CH", "MC-EN", "MCS-CH", "MCS-EN"].includes(quizz.type)) {
      const question = new MultiChoice(
        quizz.question,
        quizz.answer,
        quizz.explain,
        quizz.options,
        quizz.id
      );
      searched.push(quizz.id);
      localStorage.setItem("searchedId", JSON.stringify(searched));
      const html = question.html;
      $("#search-result").append(html);
    } else if (["TF-CH", "TF-EN"].includes(quizz.type)) {
      const question = new TrueFalse(
        quizz.question,
        quizz.answer,
        quizz.explain,
        quizz.id
      );
      searched.push(quizz.id);
      localStorage.setItem("searchedId", JSON.stringify(searched));
      const html = question.html;
      $("#search-result").append(html);
    }
  });
});

$(".create-container").on("keydown", "#search-input", async function (e) {
  if (e.keyCode == 13) {
    const quizzes = await search();
    console.log(quizzes);
    if (!quizzes[0]) return;
    quizzes.forEach((quizz) => {
      const searched = JSON.parse(localStorage.getItem("searchedId"));
      if (["MC-CH", "MC-EN", "MCS-CH", "MCS-EN"].includes(quizz.type)) {
        const question = new MultiChoice(
          quizz.question,
          quizz.answer,
          quizz.explain,
          quizz.options,
          quizz.id
        );
        searched.push(quizz.id);
        localStorage.setItem("searchedId", JSON.stringify(searched));
        const html = question.html;
        $("#search-result").append(html);
      } else if (["TF-CH", "TF-EN"].includes(quizz.type)) {
        const question = new TrueFalse(
          quizz.question,
          quizz.answer,
          quizz.explain,
          quizz.id
        );
        searched.push(quizz.id);
        localStorage.setItem("searchedId", JSON.stringify(searched));
        const html = question.html;
        $("#search-result").append(html);
      }
    });
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
      data.options,
      data.id
    );
    const html = quizz.html;
    $("#search-result").append(html);
  }
});

$(".create-container").on("click", ".create-quizz-btn", async () => {
  const language = $("#search-language").val();
  const create = $("input[name='question-type']:checked").val();
  const type = `${create}-${language}`;
  const question = $(".question-text").val();
  const explain = $(".explain-text").val();
  if (["TF-CH", "TF-EN"].includes(type)) {
    const answer = $("input[name='answer']:checked").val();
    const quizzObj = {
      question,
      answer: [transToBoolean(answer)],
      type,
      explain,
    };
    const data = await generateQuizzData(quizzObj);
    const quizz = new TrueFalse(
      data.question,
      data.answer,
      data.explain,
      data.id
    );
    const html = quizz.html;
    $(".container-right").append(html);
  }
  if (["MC-CH", "MC-EN"].includes(type)) {
    const answer = $("input[name='answer']:checked").val();
    const optionA = $("#optionA").val();
    const optionB = $("#optionB").val();
    const optionC = $("#optionC").val();
    const optionD = $("#optionD").val();
    const quizzObj = {
      question,
      options: { A: optionA, B: optionB, C: optionC, D: optionD },
      answer: [answer],
      type,
      explain,
    };
    const data = await generateQuizzData(quizzObj);
    const quizz = new MultiChoice(
      data.question,
      data.answer,
      data.explain,
      data.options,
      data.id
    );
    const html = quizz.html;
    $(".container-right").append(html);
  }
  if (["MCS-CH", "MCS-EN"].includes(type)) {
    const answerArray = [];
    $('input[name="answer"]:checked').each(function () {
      answerArray.push($(this).val());
    });
    const optionA = $("#optionA").val();
    const optionB = $("#optionB").val();
    const optionC = $("#optionC").val();
    const optionD = $("#optionD").val();
    const quizzObj = {
      question,
      options: { A: optionA, B: optionB, C: optionC, D: optionD },
      answer: answerArray,
      type,
      explain,
    };
    const data = await generateQuizzData(quizzObj);
    const quizz = new MultiChoice(
      data.question,
      data.answer,
      data.explain,
      data.options,
      data.id
    );
    const html = quizz.html;
    $(".container-right").append(html);
  }
});

const generateQuizzData = async (quizzObj) => {
  const result = await axios.post("/api/1.0/question/createmanual", quizzObj);
  const { data } = result.data;
  return data;
};

const search = async () => {
  const language = $("#search-language").val();
  const create = $("input[name='question-type']:checked").val();
  const type = `${create}-${language}`;
  const query = $("#search-input").val();
  let searchedArray;
  const resultArray = localStorage.getItem("searchedId");
  if (!resultArray) {
    searchedArray = [];
  } else {
    searchedArray = resultArray;
  }
  const searchObj = { q: query, type, excludeIds: searchedArray };
  const result = await axios.post(`/api/1.0/question/search`, searchObj);
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

const transToBoolean = (answer) => {
  if (answer === "true") return true;
  return false;
};
