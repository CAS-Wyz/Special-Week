let questions = [];
let currentIndex = 0;
let score = 0;

fetch('../data/fake-ou-reel.json')
  .then(r => r.json())
  .then(data => {
    const all = data["fake-ou-reel"];
    const shuffled = all.sort(() => Math.random() - 0.5);
    questions = shuffled.slice(0, 5);
    renderQuestion();
  });

function renderQuestion() {
  if (currentIndex >= questions.length) {
    showEndScreen();
    return;
  }

  const q = questions[currentIndex];

  // Mise à jour de la progression
  document.getElementById('progress-bar').innerHTML =
    `Question <span id="current-q">${currentIndex + 1}</span>/5`;

  document.getElementById('feedback').classList.add('hidden');
  document.getElementById('choices').classList.remove('hidden');

  const imageDisplay = document.getElementById('image-display');
  imageDisplay.innerHTML = '';

  if (q.type === 'image') {
    const img = document.createElement('img');
    img.alt = 'À analyser';
    img.src = q.chemin;
    
    // NOUVEAU : On ajoute les propriétés pour le zoom
    img.className = "clickable-image";
    img.style.cursor = 'zoom-in';
    img.onclick = () => openModal(q.chemin);
    
    imageDisplay.appendChild(img);
  } else if (q.type === 'texte') {
    const p = document.createElement('p');
    p.id = 'game-texte';
    p.textContent = q.texte;
    imageDisplay.appendChild(p);
  }
}

function checkAnswer(userClickedReel) {
  const q = questions[currentIndex];
  const correct = userClickedReel === !q.estFake;

  if (correct) {
    score++;
    const globalScore = parseInt(localStorage.getItem('globalScore')) || 0;
    localStorage.setItem('globalScore', globalScore + 10);
  }

  document.getElementById('choices').classList.add('hidden');

  const feedbackText = document.getElementById('feedback-text');
  feedbackText.textContent = correct ? '✅ Bonne réponse !' : '❌ Mauvaise réponse.';
  document.getElementById('feedback').classList.remove('hidden');
}

function nextQuestion() {
  currentIndex++;
  renderQuestion();
}

function showEndScreen() {
  const progression = JSON.parse(localStorage.getItem('progression')) || {};
  progression.fakeOrReal = 'TERMINÉ';
  localStorage.setItem('progression', JSON.stringify(progression));

  const pct = Math.round((score / 5) * 100);
  let mention = '';
  if (pct === 100) mention = 'Parfait ! 🏆';
  else if (pct >= 60) mention = 'Bien joué ! 👍';
  else mention = 'Continue de t\'entraîner ! 💪';

  document.querySelector('.card-container').innerHTML =
    `<div class="end-screen">
      <h2>Résultat final</h2>
      <div class="end-score">${score}<span>/5</span></div>
      <p class="end-mention">${mention}</p>
      <a href="apprentissage.html" class="next-btn">Retour aux jeux</a>
    </div>`;
}

// --- NOUVEAU : Fonctions pour le Zoom Image (Modal) ---
function openModal(imageSrc) {
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  if(modal && modalImg) {
    modalImg.src = imageSrc;
    modal.classList.remove('hidden');
  }
}

function closeModal() {
  const modal = document.getElementById('image-modal');
  if(modal) modal.classList.add('hidden');
}