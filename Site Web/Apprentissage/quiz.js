const CATEGORY_LABELS = {
  partie1: '// MODULE 1 — QU\'EST-CE QUE L\'IA ?',
  partie2: '// MODULE 2 — FAKE NEWS',
  partie3: '// MODULE 3 — HALLUCINATIONS DE L\'IA',
  partie4: '// MODULE 4 — REPÉRER UN CONTENU DOUTEUX'
};

let questions = [];
let currentIndex = 0;
let score = 0;

function startQuiz() {
  fetch('../quizzes.json')
    .then(r => r.json())
    .then(data => {
      questions = data.quizzes.general.questions;
      currentIndex = 0;
      score = 0;

      document.getElementById('q-total').textContent = questions.length;
      document.getElementById('quiz-start').classList.add('hidden');
      document.getElementById('quiz-game').classList.remove('hidden');

      renderQuestion();
    });
}

function renderQuestion() {
  if (currentIndex >= questions.length) {
    showEndScreen();
    return;
  }

  const q = questions[currentIndex];

  document.getElementById('q-current').textContent = currentIndex + 1;
  document.getElementById('q-score').textContent = (score * 10) + ' pts';

  const progress = ((currentIndex) / questions.length) * 100;
  document.getElementById('quiz-progress-bar').style.width = progress + '%';

  document.getElementById('q-category').textContent = CATEGORY_LABELS[q.category] || '';
  document.getElementById('q-question').textContent = q.question;

  const explanation = document.getElementById('q-explanation');
  explanation.textContent = '';
  explanation.classList.add('hidden');

  const optionsContainer = document.getElementById('q-options');
  optionsContainer.innerHTML = q.options.map((opt, i) =>
    `<button class="quiz-option" onclick="answerQuestion(${i})">${opt}</button>`
  ).join('');
}

function answerQuestion(selectedIndex) {
  const q = questions[currentIndex];
  const buttons = document.querySelectorAll('.quiz-option');

  buttons.forEach(btn => btn.disabled = true);

  const isCorrect = selectedIndex === q.correctIndex;
  if (isCorrect) {
    score++;
    const globalScore = parseInt(localStorage.getItem('globalScore')) || 0;
    localStorage.setItem('globalScore', globalScore + 10);
  }

  buttons[selectedIndex].classList.add(isCorrect ? 'correct' : 'incorrect');
  if (!isCorrect) {
    buttons[q.correctIndex].classList.add('correct');
  }

  document.getElementById('q-score').textContent = (score * 10) + ' pts';

  const explanation = document.getElementById('q-explanation');
  explanation.textContent = q.explanation;
  explanation.classList.remove('hidden');

  setTimeout(() => {
    currentIndex++;
    renderQuestion();
  }, 3000);
}

function showEndScreen() {
  document.getElementById('quiz-game').classList.add('hidden');
  document.getElementById('quiz-end').classList.remove('hidden');

  const points = score * 10;
  document.getElementById('end-score').textContent = points + ' pts  (' + score + ' / ' + questions.length + ' bonnes réponses)';

  const progression = JSON.parse(localStorage.getItem('progression')) || {};
  if (points >= 150) {
    progression.quiz = 'TERMINÉ';
  }
  localStorage.setItem('progression', JSON.stringify(progression));

  let msg;
  if (points >= 200)      msg = 'Parfait ! Tu es incollable ! 🎉';
  else if (points >= 150) msg = 'Objectif atteint ! Badge débloqué ! 💪';
  else if (points >= 100) msg = 'Bien joué ! Il te manque ' + (150 - points) + ' pts pour le badge.';
  else                    msg = 'Continue à apprendre ! Il te faut 150 pts minimum pour le badge.';

  document.getElementById('end-msg').textContent = msg;
}

function restartQuiz() {
  document.getElementById('quiz-end').classList.add('hidden');
  currentIndex = 0;
  score = 0;
  document.getElementById('quiz-game').classList.remove('hidden');
  renderQuestion();
}
