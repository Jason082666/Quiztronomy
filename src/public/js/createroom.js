/* eslint-disable no-undef */
import { MultiChoice, TrueFalse } from "./question_module.js";
localStorage.setItem("searchedId", "[]");
localStorage.setItem("quizzes", "{}");
const CancelToken = axios.CancelToken;
let source;
$("#create-by-system").on("change", function () {
  if ($(this).is(":checked")) {
    $(".search-component").show();
    $("#search-result").show();
    $(".quizz-handy-container").hide();
    $(".quizz").show();
  }
});

$("#create-by-hand").on("change", function () {
  if ($(this).is(":checked")) {
    $(".search-component").hide();
    $("#search-result").hide();
    $(".quizz-handy-container").show();
    $(".quizz").hide();
  }
});

$(".create-container").on("click", ".MC-handy", function () {
  $(".quizz-handy-container").html(`<div class="mcs-options">
  <label>Enter Quiz Question:</label>
  <input type="text" class="question-text">
  <div class="options-container">
  <div class="option-a">
  <label>A</label>
  <input type="radio" id="radioA" name="answer" value="A">
  <input type="text" id="optionA" name="optionA">
  </div>
  <div class="option-b">
  <label>B</label>
  <input type="radio" id="radioB" name="answer" value="B">
  <input type="text" id="optionB" name="optionB">
  </div>
    <div class="option-c">
  <label>C</label>
  <input type="radio" id="radioC" name="answer" value="C">
  <input type="text" id="optionC" name="optionC">
  </div>
    <div class="option-d">
  <label>D</label>
  <input type="radio" id="radioD" name="answer" value="D">
  <input type="text" id="optionD" name="optionD">
  </div>
  <div class="explain-container">
    <label>Answer Explaination :</label>
    <textarea class= "explain-text"></textarea>
    <div class="submit-btn-container">
    <button type="submit" class="create-quizz-btn">Confirm</button>
    </div>
  </div>
  </div>
`);
});

$(".create-container").on("click", ".MCS-handy", function () {
  $(".quizz-handy-container").html(`<div class="mcs-options">
  <label>Enter Quiz Question:</label>
  <input type="text" class="question-text">
  <div class="options-container">
  <div class="option-a">
  <label>A</label>
  <input type="checkbox" id="checkA" name="answer" value="A">
  <input type="text" id="optionA" name="optionA">
  </div>
  <div class="option-b"> 
  <label>B</label>
  <input type="checkbox" id="checkB" name="answer" value="B">
  <input type="text" id="optionB" name="optionB">
  </div>
  <div class="option-c"> 
  <label>C</label>
  <input type="checkbox" id="checkC" name="answer" value="C">
  <input type="text" id="optionC" name="optionC">
  </div>
  <div class="option-d"> 
  <label>D</label>
  <input type="checkbox" id="checkD" name="answer" value="D">
  <input type="text" id="optionD" name="optionD">
  </div>
  <div class="explain-container">
  <label>Answer Explaination :</label>
  <textarea class= "explain-text"></textarea>
  <div class="submit-btn-container">
  <button type="submit" class="create-quizz-btn">Confrim</button>
  </div>
  </div>
</div>`);
});

$(".create-container").on("click", ".TF-handy", function () {
  $(".quizz-handy-container").html(`<div class="tf-options">
  <label>Enter Quiz Question:</label>
  <input type="text" class="question-text">
  <div class="options-container">
  <div class="tf-container">
  <label>True</label>
  <input type="radio" name="answer" value="true" class="tf-option">
  <label>False</label>
  <input type="radio" name="answer" value="false" class="tf-option">
  </div>
  </div>
  <br>
    <div class="explain-container">
  <label>Answer Explaination :</label>
  <textarea class= "explain-text"></textarea>
  <div class="submit-btn-container">
  <button type="submit" class="create-quizz-btn">Confirm</button>
  </div>
  </div>
</div>`);
});

$(".create-container").on("click", "#search-submit", async function () {
  const quizzes = await search();
  if (quizzes === null) {
    return Toast.fire({
      icon: "warning",
      title: "Please select a quiz type you want.",
    });
  }
  if (quizzes === undefined) {
    return Toast.fire({
      icon: "warning",
      title: "Please enter the quiz title you want to search.",
    });
  }
  if (!quizzes[0]) {
    return Toast.fire({
      icon: "warning",
      title: "No quiz found",
    });
  }
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
    if (quizzes === null) {
      return Toast.fire({
        icon: "warning",
        title: "Please select a quiz type.",
      });
    }
    if (quizzes === undefined) {
      return Toast.fire({
        icon: "warning",
        title: "Please enter the quiz title you want to search.",
      });
    }
    if (!quizzes[0]) {
      return Toast.fire({
        icon: "warning",
        title: "No quiz found",
      });
    }
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
  const searched = JSON.parse(localStorage.getItem("searchedId"));
  searched.push(data.id);
  localStorage.setItem("searchedId", JSON.stringify(searched));
  console.log("data", data);
  if (!data) return;
  if (["TF-CH", "TF-EN"].includes(data.type)) {
    const quizz = new TrueFalse(
      data.question,
      data.answer,
      data.explain,
      data.id
    );
    const html = quizz.html;
    html.prepend(
      `<div class="ai-icon-container"><img src="/img/ai.png" alt="ai" width="30" height="30"></div>`
    );
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
    html.prepend(
      `<div class="ai-icon-container"><img src="/img/ai.png" alt="ai" width="30" height="30"></div>`
    );
    $("#search-result").append(html);
  }
  $("#fetch-ai-loading").hide();
  saveQuizzItemToLocal(data);
});

$(".create-container").on("click", ".create-quizz-btn", async () => {
  const language = $("#search-language").val();
  const create = $("input[name='question-type']:checked").val();
  const type = `${create}-${language}`;
  const question = $(".question-text").val();
  if (!question) {
    return Toast.fire({
      icon: "warning",
      title: "Please enter your quiz title.",
    });
  }
  const explain = $(".explain-text").val();
  if (!explain) {
    return Toast.fire({
      icon: "warning",
      title: "Please enter your quiz explaination.",
    });
  }
  if (["TF-CH", "TF-EN"].includes(type)) {
    const answer = $("input[name='answer']:checked").val();
    if (!answer) {
      return Toast.fire({
        icon: "warning",
        title: "Please check the correct answer.",
      });
    }
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
    saveQuizzItemToLocal({ ...quizzObj, id: data.id });
    const html = quizz.html;
    html.find(".icon-container").addClass("hide-cancle-btn");
    const controls = html.find(".controls"); // 檢查是否已經存在 controls
    if (controls.length === 0) {
      const control = $(`<div class="controls">
      <span class="position-label"></span>
      <span class="count-down-text">select time</span>
      <img class="time-arrow" src="/img/arrow.png" alt="arrow">
      <input type="number" min="0" max="60" value="10">
    </div>`);
      html.prepend(control);
    }
    $(".container-right").append(html);
    Toast.fire({
      icon: "warning",
      title: "Quiz generated !",
    });
    updatePositionLabels();
    return;
  }
  if (["MC-CH", "MC-EN"].includes(type)) {
    const answer = $("input[name='answer']:checked").val();
    if (!answer) {
      return Toast.fire({
        icon: "warning",
        title: "Please check the correct answer.",
      });
    }
    const optionA = $("#optionA").val();
    if (!optionA) {
      return Toast.fire({
        icon: "warning",
        title: "Please enter option A.",
      });
    }
    const optionB = $("#optionB").val();
    if (!optionB) {
      return Toast.fire({
        icon: "warning",
        title: "Please enter option B.",
      });
    }
    const optionC = $("#optionC").val();
    if (!optionC) {
      return Toast.fire({
        icon: "warning",
        title: "Please enter option C.",
      });
    }
    const optionD = $("#optionD").val();
    if (!optionD) {
      return Toast.fire({
        icon: "warning",
        title: "Please enter option D.",
      });
    }
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
    saveQuizzItemToLocal({ ...quizzObj, id: data.id });
    const html = quizz.html;
    html.find(".icon-container").addClass("hide-cancle-btn");
    const controls = html.find(".controls"); // 檢查是否已經存在 controls
    if (controls.length === 0) {
      const control = $(`<div class="controls">
      <span class="position-label"></span>
      <span class="count-down-text">select time</span>
      <img class="time-arrow" src="/img/arrow.png" alt="arrow">
      <input type="number" min="0" max="60" value="10">
    </div>`);
      html.prepend(control);
    }
    $(".container-right").append(html);
    Toast.fire({
      icon: "warning",
      title: "Quiz generated !",
    });
    updatePositionLabels();
    return;
  }
  if (["MCS-CH", "MCS-EN"].includes(type)) {
    const answerArray = [];
    if ($('input[name="answer"]:checked').length == 0) {
      return Toast.fire({
        icon: "warning",
        title: "Please check the correct answers.",
      });
    }
    $('input[name="answer"]:checked').each(function () {
      answerArray.push($(this).val());
    });
    const optionA = $("#optionA").val();
    if (!optionA) {
      return Toast.fire({
        icon: "warning",
        title: "Please enter option A.",
      });
    }
    const optionB = $("#optionB").val();
    if (!optionB) {
      return Toast.fire({
        icon: "warning",
        title: "Please enter option B.",
      });
    }
    const optionC = $("#optionC").val();
    if (!optionC) {
      return Toast.fire({
        icon: "warning",
        title: "Please enter option C.",
      });
    }
    const optionD = $("#optionD").val();
    if (!optionD) {
      return Toast.fire({
        icon: "warning",
        title: "Please enter option D.",
      });
    }
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
    saveQuizzItemToLocal({ ...quizzObj, id: data.id });
    const html = quizz.html;
    html.find(".icon-container").addClass("hide-cancle-btn");
    const controls = html.find(".controls"); // 檢查是否已經存在 controls
    if (controls.length === 0) {
      const control = $(`<div class="controls">
      <span class="position-label"></span>
      <span class="count-down-text">select time</span>
      <img class="time-arrow" src="/img/arrow.png" alt="arrow">
      <input type="number" min="0" max="60" value="10">
    </div>`);
      html.prepend(control);
    }
    $(".container-right").append(html);
    Toast.fire({
      icon: "warning",
      title: "Quiz generated !",
    });
    updatePositionLabels();
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
  if (!create) return null;
  const type = `${create}-${language}`;
  const query = $("#search-input").val();
  if (!query) return undefined;
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

$(".cancel-fetch-ai").on("click", () => {
  cancelFetchOpenAI();
  $(".load-main").hide();
});

const searchByAI = async () => {
  const language = $("#search-language").val();
  const create = $("input[name='question-type']:checked").val();
  if (!create) {
    return Toast.fire({
      icon: "warning",
      title: "Please select a quiz type.",
    });
  }
  const type = `${create}-${language}`;
  const q = $("#search-input").val();
  if (!q) {
    return Toast.fire({
      icon: "warning",
      title: "Please enter the quiz title you want to search.",
    });
  }
  $("#fetch-ai-loading").show();
  const obj = { q, type, mode: "AI" };
  source = CancelToken.source();
  try {
    const result = await axios.post("/api/1.0/question/create", obj, {
      cancelToken: source.token,
    });
    const { data } = result.data;
    Toast.fire({
      icon: "success",
      title: "AI generated a quiz for you !",
    });
    return data;
  } catch (e) {
    if (axios.isCancel()) {
      return false;
    }
  }
};
const cancelFetchOpenAI = () => {
  if (source) {
    source.cancel();
  }
};

const transToBoolean = (answer) => {
  if (answer === "true") return true;
  return false;
};

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
    draggedElement.find(".icon-container").removeClass("hide-cancle-btn");
    $(this).append(draggedElement);
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
    droppedQuizCard.find(".icon-container").addClass("hide-cancle-btn");
    const targetQuizCard = $(this);
    const controls = droppedQuizCard.find(".controls"); // 檢查是否已經存在 controls
    if (controls.length === 0) {
      const controls = $(`<div class="controls">
      <span class="position-label"></span>
      <span class="count-down-text">select time</span>
      <img class="time-arrow" src="/img/arrow.png" alt="arrow">
      <input type="number" min="0" max="60" value="10">
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
    draggedElement.find(".icon-container").addClass("hide-cancle-btn");
    const controls = draggedElement.find(".controls"); // 檢查是否已經存在 controls
    if (controls.length === 0) {
      const controls = $(`<div class="controls">
      <span class="position-label"></span>
      <span class="count-down-text">select time</span>
      <img class="time-arrow" src="/img/arrow.png" alt="arrow">
      <input type="number" min="0" max="60" value = "10">
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
  $("#pop-for-leave").show();
});

$("body").on("click", ".back-to-game-btn", () => {
  $("#pop-for-leave").hide();
});

$("body").on("click", ".no-save-btn", () => {
  window.location.href = "/";
});

$("#finish-button").on("click", () => {
  $("#pop-for-create").show();
});

$("body").on("click", ".room-ready-cancell-btn", () => {
  $("#pop-for-create").hide();
});

$("body").on("click", ".room-ready-btn", async () => {
  const gameRoomName = $("#create-room-name").val();
  if (!gameRoomName) {
    return Toast.fire({
      icon: "error",
      title: "Please enter your room name.",
    });
  }
  let countDownCheck = true;
  $('input[type="number"]').each(function () {
    const timeLimits = $(this).val();
    if (!Number.isInteger(+timeLimits) || +timeLimits <= 0) {
      countDownCheck = false;
      return;
    }
  });
  if (!countDownCheck)
    return Toast.fire({
      icon: "error",
      title: "Quiz countdown should be an integer .",
    });

  try {
    const createRoomOnMongo = await axios.post("/api/1.0/game/create", {
      gameRoomName,
    });
    const createResult = createRoomOnMongo.data.data;
    if (createResult.error) return console.log(createResult.error);
    localStorage.setItem("roomId", createResult.id);
    const createRoomOnRedis = await axios.post("/api/1.0/game/roomupdate", {
      roomId: createResult.id,
    });
    if (createRoomOnRedis.error) return console.log(createRoomOnRedis.error);
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
    localStorage.removeItem("searcheId");
    localStorage.removeItem("quizzes");
    window.location.href = `/game/room/${roomId}`;
  } catch (error) {
    console.log(error);
    Toast.fire({
      icon: "error",
      title: "There should be at least one quiz.",
    });
  }
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

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});
