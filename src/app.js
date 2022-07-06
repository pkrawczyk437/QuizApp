"use strict";
import { fetchData } from "./fetchData.js";

let currentQuestion = 0;
let questions = [];
let userAnswers = [];
const URL = "http://localhost:3000"


const handleSubmit = () => {
  const checkedInput = document.querySelector('input[name="answers"]:checked');
  const errorDiv = document.querySelector(".errorMessage");
  if (checkedInput) {
    const {
      parentElement: { id },
      value,
    } = checkedInput;
    userAnswers.push({ questionId: parseInt(id), answer: value });
    currentQuestion += 1;
    return questions[currentQuestion] <= questions[questions.length - 1]
      ? loadQuiz()
      : checkAnswers();
  }
  return errorDiv.classList.add("errorMessage--active");
};

const addListener = (selector, callback) => {
  const submitButton = document.querySelector(selector);
  submitButton.addEventListener("click", callback);
};

const loadQuiz = () => {
  const { questionName, answers, questionId } = questions[currentQuestion];
  const quizMarkup = `
        <form class="quiz">
            <h2 class="quiz__title">${questionName}</h2>
            <div class="quiz__answers" id="${questionId}">
            ${answers
      .map(
        (answer) =>
          `
                    <input id="${answer}" class="quiz__answer" type="radio" value="${answer}" name="answers"/>
                    <label for="${answer}">${answer}</label>
                    <br />
            `
      )
      .join("")}
            </div>
            <button type="button" class="quiz__submitBtn">${questions[currentQuestion] === questions[questions.length - 1]
      ? "Submit Answers"
      : "Next"
    }</button>
            </form>
            <div class="errorMessage">
              Pick answer
            </div>
            `;
  document.body.innerHTML = quizMarkup;
  addListener(".quiz__submitBtn", handleSubmit);
};

const checkAnswers = async () => {
  const correctAnswers = await fetchData(
    `${URL}/correctAnswers`
  );
  const userCorrectAnswers = userAnswers
    .map(({ answer, questionId }) => {
      return correctAnswers.find(
        (correctAnswer) =>
          correctAnswer.questionId === questionId &&
          correctAnswer.correctAnswer === answer
      );
    })
    .filter(Boolean);
  displayScore(userCorrectAnswers);
};

const reloadGame = () => window.location.reload();

const displayScore = (userCorrectAnswers) => {
  let score = `${userCorrectAnswers.length} / ${questions.length}`;
  const quizContainer = document.querySelector(".quiz");
  quizContainer.classList.add("quiz--hidden");
  const scoreMarkup = `
    <div class="score">
    <span class="score__message">
      Your score is ${score}
    </span>
     <br />
     <button class="score__restartBtn">Restart game</button>
    </div>
  `;
  document.body.innerHTML = scoreMarkup;
  addListener(".score__restartBtn", reloadGame);
};

fetchData(`${URL}/questions`).then((data) => {
  questions.push(...data);
  loadQuiz();
});