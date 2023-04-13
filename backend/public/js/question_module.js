class Quizz {
  constructor(question, answer, explain, id) {
    this.question = question;
    this.answer = answer;
    this.explain = explain;
    this.id = id;
  }
  checkAnswer(selectedOption) {
    return this.answer.includes(selectedOption);
  }

  get html() {
    const $element = $(
      `<div data-id='${this.id}' class='quiz-card quiz-card-resize' draggable="true">`
    );
    const $cancelBtn = $(`<div class="icon-container">
    <img src="https://cdn-icons-png.flaticon.com/512/399/399274.png" alt="icon">
  </div>`);
    const $questionHeader = $(`<h1 class='quizz-question'>`).text(
      this.question
    );
    $element.append($cancelBtn);
    $element.append($questionHeader);
    return $element;
  }
}

export class TrueFalse extends Quizz {
  constructor(question, answer, explain, id) {
    super(question, answer, explain, id);
  }

  get html() {
    const $element = super.html;
    const $answerText = $(`<div>Answer: ${this.answer[0]}</div>`);
    const $explainText = $(`<div>${this.explain}</div>`);
    const $questionContent = $(`<div class = "question-container hidden">`);
    $questionContent.append($answerText);
    $questionContent.append($explainText);
    $element.append($questionContent);
    return $element;
  }
}

export class MultiChoice extends Quizz {
  constructor(question, answer, explain, options, id) {
    super(question, answer, explain, id);
    this.options = options;
  }
  get html() {
    const $element = super.html;
    const $optionsList = $("<ul>");
    const $explainText = $(`<div>${this.explain}</div>`);
    for (const option in this.options) {
      const $label = $("<label>").text(`${option}`);
      const $optionItem = $(`<li>`);
      $optionItem.html(this.options[option]);
      $optionItem.on("mousemove", () => {
        if (this.checkAnswer(option)) {
          $optionItem.addClass("correct-option");
        } else {
          $optionItem.addClass("wrong-option");
        }
      });
      $optionsList.append($label);
      $optionsList.append($optionItem);
    }
    const $questionContent = $(`<div class = "question-container hidden">`);
    $questionContent.append($optionsList);
    $questionContent.append($explainText);
    $element.append($questionContent);
    return $element;
  }
}
