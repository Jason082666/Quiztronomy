/* eslint-disable no-undef */
import { MultiChoice, TrueFalse } from "./question_module.js";
localStorage.setItem("searchedId", "[]");
localStorage.setItem("quizzes", "{}");

$("#create-by-system").on("change", function () {
  if ($(this).is(":checked")) {
    $("#search-result").show();
    $(".create-container").empty();
    $(".create-container").html(`
  <label class="label-for-question" for="question-type">選擇題型：</label>
  <input type="radio" name="question-type" id="single-choice" value="MC" checked>
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
  saveQuizzArrayToLocal(quizzes);
});

$(".create-container").on("keydown", "#search-input", async function (e) {
  if (e.keyCode == 13) {
    const quizzes = await search();
    // if (!quizzes[0]) return;
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
    saveQuizzArrayToLocal(quizzes);
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
  saveQuizzItemToLocal(data);
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

// TODO:
// $(document).ready(function () {
//   $("#search-result").on("dragstart", ".quiz-card", function (event) {
//     const dataId = $(event.target).attr("data-id");
//     event.originalEvent.dataTransfer.setData("text/plain", dataId);
//   });

//   $(".container-right").on("dragover", function (event) {
//     event.preventDefault();
//   });

//   $(".container-right").on("drop", function (event) {
//     event.preventDefault();
//     const dataId = event.originalEvent.dataTransfer.getData("text");
//     const draggedElement = $(`[data-id="${dataId}"]`);
//     const containerRight = $(this);
//     const dropTarget = getDropTarget(containerRight, event.pageY);
//     if (dropTarget) {
//       draggedElement.insertBefore(dropTarget);
//     } else {
//       containerRight.append(draggedElement);
//     }
//   });

//   $(".container-right").sortable({
//     axis: "y",
//     containment: "parent",
//     tolerance: "pointer",
//     cursor: "move",
//   });
//   function getDropTarget(container, mouseY) {
//     const children = container.children();
//     for (let i = 0; i < children.length; i++) {
//       const child = $(children[i]);
//       const childTop = child.offset().top;
//       const childHeight = child.outerHeight();
//       if (mouseY >= childTop && mouseY <= childTop + childHeight) {
//         return child;
//       }
//     }
//     return null;
//   }
// });
$(document).ready(function () {
  // Drag quiz cards from search result to container-right
  $("#search-result").on("dragstart", ".quiz-card", function (event) {
    const dataId = $(event.target).attr("data-id");
    event.originalEvent.dataTransfer.setData("text/plain", dataId);
  });

  // Drag quiz cards from container-right to search result
  $(".container-right").on("dragstart", ".quiz-card", function (event) {
    // $(event.target).find(".controls").remove();
    const dataId = $(event.target).attr("data-id");
    event.originalEvent.dataTransfer.setData("text/plain", dataId);
  });

  // Allow dropping on container-right
  $(".container-right").on("dragover", function (event) {
    event.preventDefault();
  });

  // Allow dropping on search-result
  $("#search-result").on("dragover", function (event) {
    event.preventDefault();
  });

  // Handle dropping on search-result
  $("#search-result").on("drop", function (event) {
    event.preventDefault();
    const dataId = event.originalEvent.dataTransfer.getData("text");
    const draggedElement = $(`[data-id="${dataId}"]`);
    draggedElement.find(".controls").remove();
    const searchResult = $(this);
    searchResult.append(draggedElement);
    updatePositionLabels();
  });

  // Enable draggable and sortable on quiz cards in container-right
  $(".container-right .quiz-card")
    .draggable({
      revert: "invalid",
      helper: "clone",
    })
    .sortable({
      axis: "y",
      containment: "parent",
      tolerance: "pointer",
      cursor: "move",
    });

  // Enable draggable on quiz cards in search-result
  $("#search-result .quiz-card").draggable({
    revert: "invalid",
    helper: "clone",
  });

  // Allow dropping on quiz-cards in container-right
  $(".container-right").on("dragover", ".quiz-card", function (event) {
    event.preventDefault();
    $(this).addClass("drag-over");
  });

  // Remove drag-over class when leaving quiz-cards in container-right
  $(".container-right").on("dragleave", ".quiz-card", function (event) {
    event.preventDefault();
    $(this).removeClass("drag-over");
  });

  // Handle dropping quiz-cards in container-right
  $(".container-right").on("drop", ".quiz-card", function (event) {
    event.preventDefault();
    $(this).removeClass("drag-over");
    const dataId = event.originalEvent.dataTransfer.getData("text/plain");
    const droppedQuizCard = $(`[data-id="${dataId}"]`);
    const targetQuizCard = $(this);
    const controls = droppedQuizCard.find(".controls"); // 檢查是否已經存在 controls
    if (controls.length === 0) {
      const controls = $(`<div class="controls">
      <span class="position-label"></span>
      <input type="number" min="0" max="60" placeholder="選擇秒數">
    </div>`);
      droppedQuizCard.prepend(controls);
    }
    if (droppedQuizCard.index() < targetQuizCard.index()) {
      targetQuizCard.after(droppedQuizCard);
    } else {
      targetQuizCard.before(droppedQuizCard);
    }
    updatePositionLabels();
  });

  // Handle dropping on container-right
  $(".container-right").on("drop", function (event) {
    event.preventDefault();
    const dataId = event.originalEvent.dataTransfer.getData("text");
    const draggedElement = $(`[data-id="${dataId}"]`);
    const controls = draggedElement.find(".controls"); // 檢查是否已經存在 controls
    if (controls.length === 0) {
      const controls = $(`<div class="controls">
      <span class="position-label">1</span>
      <input type="number" min="0" max="60" placeholder="選擇秒數">
    </div>`);
      draggedElement.prepend(controls);
    }
    const containerRight = $(this);
    const dropTarget = getDropTarget(containerRight, event.pageY);
    if (dropTarget) {
      draggedElement.insertBefore(dropTarget);
    } else {
      containerRight.append(draggedElement);
    }
    updatePositionLabels();
  });
  // Helper function to find drop target
  function getDropTarget(container, mouseY) {
    const children = container.children();
    for (let i = 0; i < children.length; i++) {
      const child = $(children[i]);
      const childTop = child.offset().top;
      const childHeight = child.outerHeight();
      if (mouseY >= childTop && mouseY <= childTop + childHeight) {
        return child;
      }
    }
    return null;
  }
});

$(".exit-btn").on("click", () => {
  const $popOut = $(`<div class="popup-container">
  <div class="popup">
    <p class="popup-text">是否要保存遊戲模板?</p>
    <div class="popup-buttons">
      <button class="save-and-exit-btn">保存並離開</button>
      <button class="no-save-btn">不保存</button>
      <button class="back-to-game-btn">回到遊戲房間</button>
    </div>
  </div>
</div>`);
  $("body").append($popOut);
});

$("body").on("click", ".back-to-game-btn", () => {
  $(".popup-container").remove();
});

$("body").on("click", ".no-save-btn", () => {
  window.location.href = "/";
});

$("#finish-button").on("click", () => {
  const $popOut = $(`<div class="popup-container">
  <div class="popup">
    <p class="popup-text">確認創建?</p>
    <div class="popup-buttons">
      <button class="room-ready-btn">確認</button>
      <button class="room-ready-cancell-btn">取消</button>
    </div>
  </div>
</div>`);
  $("body").append($popOut);
});

$("body").on("click", ".room-ready-cancell-btn", () => {
  $(".popup-container").remove();
});

$("body").on("click", ".room-ready-btn", async () => {
  const createRoom = await axios.post("/api/1.0/game/create");
  const { data } = createRoom.data;
  // TODO:這邊要做＂請重新登錄的處理＂
  localStorage.setItem("roomId", data.id);
  if (data.error) return console.log(data.error);
  const createRoomObject = { roomId: data.id, hostId: data.founder.id };
  const createRoomOnRedis = await axios.post(
    "/api/1.0/game/create",
    createRoomObject
  );
  const createResult = createRoomOnRedis.data.data;
  if (createResult.error) return console.log(data.error);
  const quizzes = localStorage.getItem("quizzes");
  const parseQuizz = JSON.parse(quizzes);
  const readyQuizzesArray = [];
  const readyQuizzesObject = {};
  const unusedQuizzesObject = {};
  $(".container-right .quiz-card").each(function () {
    const id = $(this).attr("data-id");
    const timeLimits = $(this).find('input[type="number"]').val();
    const quizzObject = parseQuizz[id];
    quizzObject.timeLimits = timeLimits;
    readyQuizzesArray.push(quizzObject);
  });
  const founderId = localStorage.getItem("userId");
  const roomId = localStorage.getItem("roomId");
  await axios.post("/api/1.0/game/savequizz", {
    array: readyQuizzesArray,
    roomId,
    founderId,
  });
  $("#search-result .quiz-card").each(function () {
    const id = $(this).attr("data-id");
    unusedQuizzesObject[id] = -0.5;
  });
  $(".container-right .quiz-card").each(function () {
    const id = $(this).attr("data-id");
    readyQuizzesObject[id] = 1.5;
  });
  const addPopObj = { popObj: readyQuizzesObject };
  const deletePopObj = { popObj: unusedQuizzesObject };
  await axios.post("/api/1.0/question/update", addPopObj);
  await axios.post("/api/1.0/question/update", deletePopObj);
});

function updatePositionLabels() {
  const $quizCards = $(".container-right .quiz-card");
  $quizCards.each(function (i) {
    $(this)
      .find(".position-label")
      .text(i + 1);
  });
}

const saveQuizzArrayToLocal = (quizArray) => {
  const quizzes = localStorage.getItem("quizzes");
  const parseQuizzes = JSON.parse(quizzes);
  quizArray.forEach((quizObj) => {
    delete quizObj.timestamp;
    delete quizObj.createTime;
    delete quizObj.popularity;
    parseQuizzes[quizObj.id] = quizObj;
  });
  const stringifyQuizzes = JSON.stringify(parseQuizzes);
  localStorage.setItem("quizzes", stringifyQuizzes);
};

const saveQuizzItemToLocal = (quizObj) => {
  const quizzes = localStorage.getItem("quizzes");
  const parseQuizzes = JSON.parse(quizzes);
  delete quizObj.timestamp;
  delete quizObj.createTime;
  delete quizObj.popularity;
  parseQuizzes[quizObj.id] = quizObj;
  const stringifyQuizzes = JSON.stringify(parseQuizzes);
  localStorage.setItem("quizzes", stringifyQuizzes);
};

$("body").on("click", ".icon-container", async function (e) {
  e.stopPropagation();
  const id = $(this).parent().attr("data-id");
  const quizzes = localStorage.getItem("quizzes");
  const parseQuizz = JSON.parse(quizzes);
  delete parseQuizz[id];
  const stringifyObj = JSON.stringify(parseQuizz);
  localStorage.setItem("quizzes", stringifyObj);
  const obj = {};
  obj[id] = -0.5;
  const popObj = { popObj: obj };
  await axios.post("/api/1.0/question/update", popObj);
  $(this).parent().remove();
});

$("body").on("click", ".quiz-card", async function (e) {
  if (!$(e.target).is("input")) {
    $(this).children(".question-container").toggleClass("hidden");
    $(this).toggleClass("quiz-card-resize");
  }
});
