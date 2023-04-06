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
    const $element = $(`<div data-id='${this.id}'>`);
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
    const $trueLabel = $("<label>").text("True");
    const $trueInput = $("<input>")
      .attr("type", "radio")
      .attr("name", `${this.id}-answer`)
      .val("true");
    $trueLabel.append($trueInput);
    const $falseLabel = $("<label>").text("False");
    const $falseInput = $("<input>")
      .attr("type", "radio")
      .attr("name", `${this.id}-answer`)
      .val("false");
    $falseLabel.append($falseInput);
    $("#search-result").on("click", `input[name="${this.id}-answer"]`, (e) => {
      const $selectedOption = $(
        `input[name="${this.id}-answer"]:checked`
      ).val();
      const isCorrect = this.checkAnswer(parseBoolean($selectedOption));
      if (isCorrect) {
        console.log(true);
      } else {
        console.log(false);
      }
    });
    const $optionsList = $(`<ul data-id=${this.id}>`)
      .append($(`<li data-id=${this.id}>`).append($trueLabel))
      .append($(`<li data-id=${this.id}>`).append($falseLabel));
    $element.append($optionsList);
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
    for (const option in this.option) {
      const $optionItem = $(`<ul data-id=${this.id}>`);
      $optionItem.html(this.option[option]);
      $optionItem.attr("data-option", option);
      $optionItem.click((event) => {
        const $selectedOption = $(event.currentTarget).attr("data-option");
        const isCorrect = this.checkAnswer($selectedOption);
        if (isCorrect) {
          console.log(true);
        } else {
          console.log(false);
        }
      });
      $optionsList.append($optionItem);
      $element.append($optionsList);
    }
    return $element;
  }
}

function parseBoolean(str) {
  return str === "true";
}
