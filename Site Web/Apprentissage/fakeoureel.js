let questions = [];
let currentIndex = 0;
let score = 0;

fetch('../data/fake-ou-reel.json')
  .then(r => r.json())
  .then(data => {
    questions = data.questions;
    renderQuestion();
  });

function renderQuestion() {
  if (currentIndex >= questions.length) {
    showEndScreen();
    return;
  }

  const q = questions[currentIndex];

  document.getElementById('current-q').textContent = currentIndex + 1;
  document.getElementById('progress-bar').textContent =
    `Question ${currentIndex + 1}/${questions.length}`;

  document.getElementById('feedback').classList.add('hidden');
  document.getElementById('choices').classList.remove('hidden');

  const imageDisplay = document.getElementById('image-display');
  imageDisplay.innerHTML = '';

  if (q.type === 'image') {
    const img = document.createElement('img');
    img.id = 'game-image';
    img.alt = 'À analyser';
    img.src = '../' + q.contenu;
    imageDisplay.appendChild(img);
  } else if (q.type === 'texte') {
    const p = document.createElement('p');
    p.id = 'game-texte';
    p.textContent = q.contenu;
    imageDisplay.appendChild(p);
  }
}

function checkAnswer(userClickedReel) {
  const q = questions[currentIndex];
  const correct = userClickedReel === q.estReel;

  if (correct) score++;

  document.getElementById('choices').classList.add('hidden');

  const feedback = document.getElementById('feedback');
  const feedbackText = document.getElementById('feedback-text');
  feedbackText.textContent = (correct ? '✅ Bonne réponse ! ' : '❌ Mauvaise réponse. ') + q.explication;
  feedback.classList.remove('hidden');
}

function nextQuestion() {
  currentIndex++;
  renderQuestion();
}

function showEndScreen() {
  document.querySelector('.card-container').innerHTML =
    `<div style="text-align:center; padding: 2rem;">
      <h2>Résultat</h2>
      <p>Tu as obtenu <strong>${score} / ${questions.length}</strong></p>
      <a href="apprentissage.html" class="next-btn">Retour aux jeux</a>
    </div>`;
}
