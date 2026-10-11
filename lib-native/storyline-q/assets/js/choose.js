let selectEvent;
let selectedAnswer;

function checkChoose(event, answer) {
  selectedAnswer = answer;
  selectEvent = event;
  let correctAnswer = null;
  let chooses = document.querySelectorAll(".active .choose");
  let correct = document.querySelectorAll(".active .choose.correct");
  chooses.forEach((el) => {
    el.classList.remove("false");
  });

  if (selectedAnswer.answer) {
    correct.forEach((el) => {
      el.classList.add("true");
    });
    correctAnswer = true;
  } else {
    selectEvent.target.classList.add("false");
    correctAnswer = false;
  }
  selectedAnswer.solve = true;

  return [correctAnswer, selectedAnswer];
}

function toggleMultiChoiceAnswer(answers, index, isSubmitted) {
  if (!Array.isArray(answers) || isSubmitted || index < 0 || index >= answers.length) {
    return false;
  }

  if (answers[index].select) {
    answers.slice(index).forEach((answer) => {
      answer.select = false;
    });
    return true;
  }

  const firstUnselectedIndex = answers.findIndex((answer) => !answer.select);
  if (index !== firstUnselectedIndex) {
    return false;
  }

  answers[index].select = true;
  return true;
}

function hasSelectedMultiChoiceAnswer(answers) {
  return Array.isArray(answers) && answers.some((answer) => answer.select);
}

function checkMultiChoiceAnswers(answers) {
  if (!Array.isArray(answers) || !hasSelectedMultiChoiceAnswer(answers)) {
    return false;
  }

  return answers.every((answer) => Boolean(answer.select) === Boolean(answer.answer));
}

function getTrueAnswer() {
  let chooses = document.querySelectorAll(".active .choose");
  let correct = document.querySelectorAll(".active .choose.correct");
  setTimeout(() => {
    correct.forEach((el) => {
      el.classList.add("true");
    });
    chooses.forEach((el) => {
      el.style.cssText = "pointer-events:none";
    });
  }, 1000);
}

function resetAnswer() {
  let chooses = document.querySelectorAll(".active .choose");
  chooses.forEach((el) => {
    el.classList.remove("false");
    el.classList.remove("true");
  });
}
