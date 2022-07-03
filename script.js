let currentQuestion = 0;
let questions = [];
let userAnswers = [];

const fetchData = async (url) => {
  try {
    const { data } = await axios.get(url);
    return data
  } catch ({ message }) {
    const error = `<span>${message}</span>`;
    document.body.innerHTML = error;
  }
};


const handleSubmit = () => {
  const checkedInput = document.querySelector('input[name="answers"]:checked');
  if (checkedInput) {
    const {
      parentElement: { id },
      value,
    } = checkedInput;
    userAnswers.push({ questionId: parseInt(id), answer: value });
    currentQuestion += 1;
    if (questions[currentQuestion] <= questions[questions.length - 1]) {
      loadQuiz();
    } else {
      checkAnswers();
    }
  } else {
    const errorDiv = document.querySelector(".errorMessage");
    errorDiv.classList.add("errorMessage--active");
  }
};

const addEventListener = (selector, callback) => {
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
            <button type="button" class="quiz__submitBtn">${
              questions[currentQuestion] === questions[questions.length - 1]
                ? "Submit Answers"
                : "Next"
            }</button>
            </form>
            <div class="errorMessage">
              Pick answer
            </div>
            
            `
  document.body.innerHTML = quizMarkup;
  addEventListener(".quiz__submitBtn", handleSubmit);
};


const checkAnswers = async () => {
  const correctAnswers = await fetchData("http://localhost:3000/correctAnswers")
  const userCorrectAnswers = userAnswers.map(({ answer, questionId }) => {
    return correctAnswers.find(correctAnswer => correctAnswer.questionId === questionId && correctAnswer.correctAnswer === answer)
  }).filter(Boolean)
  displayScore(userCorrectAnswers)
}

const reloadGame = () => window.location.reload()

const displayScore = (userCorrectAnswers) => {
  let score = `${userCorrectAnswers.length} / ${questions.length}`
  const quizContainer = document.querySelector('.quiz')
  quizContainer.classList.add('quiz--hidden')
  scoreMarkup = `
    <div class="score">
    <span class="score__message">
      Your score is ${score}
    </span>
     <br />
     <button class="score__restartBtn">Restart game</button>
    </div>
  `;
  document.body.innerHTML = scoreMarkup
  addEventListener(".score__restartBtn", reloadGame)
}

fetchData("http://localhost:3000/questions").then(data => {
  questions.push(...data);
  loadQuiz()
});