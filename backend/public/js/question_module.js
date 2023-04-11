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
    const $element = $(`<div data-id='${this.id}' class='quiz-card'>`);
    const $questionHeader = $(`<h1 class='quizz-question'>`).text(
      this.question
    );
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
    $element.append($answerText);
    $element.append($explainText);
    return $element;
  }
}

export class MultiChoice extends Quizz {
  constructor(question, answer, explain, option, id) {
    super(question, answer, explain, id);
    this.option = option;
  }
  get html() {
    const $element = super.html;
    const $optionsList = $("<ul>");
    const $explainText = $(`<div>${this.explain}</div>`);
    for (const option in this.option) {
      const $label = $("<label>").text(`${option}`);
      const $optionItem = $(`<li>`);
      $optionItem.html(this.option[option]);
      $optionItem.on("click", () => {
        if (this.checkAnswer(option)) {
          $optionItem.toggleClass("correct-option");
        } else {
          $optionItem.toggleClass("wrong-option");
        }
      });
      $optionsList.append($label);
      $optionsList.append($optionItem);
    }
    $element.append($optionsList);
    $element.append($explainText);
    return $element;
  }
}
// this.answer.includes;
