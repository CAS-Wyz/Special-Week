
function openTopic(_topicId) {
  document.getElementById('list-view').classList.add('hidden');
  document.querySelector('.sub-nav').classList.add('hidden');
  document.getElementById('detail-view').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeTopic() {
  document.getElementById('detail-view').classList.add('hidden');
  document.getElementById('list-view').classList.remove('hidden');
  document.querySelector('.sub-nav').classList.remove('hidden');
}

// ── Mini Quiz ──────────────────────────────────────────────

let quizQuestions = null;
let currentQuestion = 0;
let score = 0;

function toggleQuiz() {
  const quizSection = document.getElementById('quiz-section');
  quizSection.classList.toggle('hidden');

  if (!quizSection.classList.contains('hidden')) {
    if (!quizSection.dataset.loaded) {
      const partie = quizSection.dataset.partie;
      loadQuiz(partie);
    }
    quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function loadQuiz(partie) {
  fetch('../quizzes.json')
    .then(r => r.json())
    .then(data => {
      quizQuestions = data.quizzes[partie].questions;
      currentQuestion = 0;
      score = 0;
      document.getElementById('quiz-section').dataset.loaded = 'true';
      renderQuestion();
    });
}

function renderQuestion() {
  const content = document.getElementById('quiz-content');

  if (currentQuestion >= quizQuestions.length) {
    const total = quizQuestions.length;
    let msg = score === total ? 'Parfait ! 🎉' : score >= Math.ceil(total / 2) ? 'Bien joué !' : 'Continue à apprendre !';
    content.innerHTML = `
      <div class="quiz-end">
        <p class="quiz-score">${score} / ${total}</p>
        <p class="quiz-end-msg">${msg}</p>
        <button class="quiz-restart-btn" onclick="restartQuiz()">Recommencer</button>
      </div>
    `;
    return;
  }

  const q = quizQuestions[currentQuestion];
  const optionsHTML = q.options.map((opt, i) =>
    `<button class="quiz-option" onclick="answerQuestion(${i})">${opt}</button>`
  ).join('');

  content.innerHTML = `
    <div class="quiz-header">// MINI-QUIZ • QUESTION ${currentQuestion + 1}/${quizQuestions.length}</div>
    <div class="quiz-question-block">
      <p class="quiz-question">${q.question}</p>
      ${optionsHTML}
    </div>
  `;
}

function answerQuestion(selectedIndex) {
  const q = quizQuestions[currentQuestion];
  const buttons = document.querySelectorAll('.quiz-option');

  buttons.forEach(btn => btn.disabled = true);

  const isCorrect = selectedIndex === q.correctIndex;
  if (isCorrect) score++;

  buttons[selectedIndex].classList.add(isCorrect ? 'correct' : 'incorrect');
  if (!isCorrect) {
    buttons[q.correctIndex].classList.add('correct');
  }

  const block = document.querySelector('.quiz-question-block');
  const explanation = document.createElement('p');
  explanation.className = 'quiz-explanation';
  explanation.textContent = q.explanation;
  block.appendChild(explanation);

  setTimeout(() => {
    currentQuestion++;
    renderQuestion();
  }, 3000);
}

function restartQuiz() {
  const quizSection = document.getElementById('quiz-section');
  currentQuestion = 0;
  score = 0;
  delete quizSection.dataset.loaded;
  const partie = quizSection.dataset.partie;
  loadQuiz(partie);
}
