const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8080'
  : '';

// Valide que le chemin d'image pointe vers les ressources locales connues
function isSafeImagePath(path) {
  return typeof path === 'string' &&
    /^\.\.\/src\//.test(path) &&
    !/[<>"'&]/.test(path);
}

let questions = [];
let currentIndex = 0;
let score = 0; // Compteur des incohérences trouvées (pour l'écran de fin)
let totalIncoherencesPossibles = 0;
let userSelections = []; 

// 1. Récupération des données depuis le JSON
fetch('../data/incoherences.json')
  .then(r => r.json())
  .then(data => {
    questions = data.incoherences;
    
    // Calcul du nombre total de bonnes réponses possibles dans tout le jeu
    questions.forEach(q => {
      totalIncoherencesPossibles += q.correctIndex.length;
    });

    renderQuestion();
  })
  .catch(error => console.error("Erreur lors du chargement du JSON :", error));

// 2. Affichage d'une question
function renderQuestion() {
  if (currentIndex >= questions.length) {
    showEndScreen();
    return;
  }

  const q = questions[currentIndex];
  userSelections = []; // Reset des choix de l'utilisateur

  // Mise à jour de la barre de progression
  document.getElementById('progress-bar').innerHTML = `Question <span id="current-q">${currentIndex + 1}</span>/${questions.length}`;

  // Réinitialisation de l'affichage
  document.getElementById('feedback').classList.add('hidden');
  document.getElementById('valider-btn').classList.remove('hidden');
  
  const imageDisplay = document.getElementById('image-display');
  imageDisplay.innerHTML = '';

  // Type IMAGE : Ajout du zoom au clic
  if (q.type === 'image') {
    const img = document.createElement('img');
    img.alt = 'À analyser';
    img.src = isSafeImagePath(q.chemin) ? q.chemin : '';
    img.className = "clickable-image";
    img.style.maxHeight = '300px';
    img.style.borderRadius = '8px';
    img.style.cursor = 'zoom-in';
    img.onclick = () => { if (isSafeImagePath(q.chemin)) openModal(q.chemin); };
    imageDisplay.appendChild(img);
  } 
  // Type TEXTE
  else if (q.type === 'texte') {
    const p = document.createElement('p');
    p.className = 'challenge-text';
    p.textContent = `"${q.texte}"`;
    imageDisplay.appendChild(p);
  }

  // Génération des boutons d'options
  const optionsGrid = document.getElementById('options-grid');
  optionsGrid.innerHTML = ''; 

  q.options.forEach((optText, index) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = optText;
    btn.onclick = () => toggleSelection(btn, index);
    optionsGrid.appendChild(btn);
  });
}

// 3. Gestion de la sélection multiple
function toggleSelection(btn, index) {
  if (userSelections.includes(index)) {
    userSelections = userSelections.filter(i => i !== index);
    btn.classList.remove('selected');
  } else {
    userSelections.push(index);
    btn.classList.add('selected');
  }
}

// 4. Vérification et calcul des points (+5 pts par bonne réponse)
function checkAnswer() {
  const q = questions[currentIndex];
  const boutons = document.querySelectorAll('.option-btn');
  
  document.getElementById('valider-btn').classList.add('hidden');
  boutons.forEach(btn => btn.disabled = true);

  let bonnesReponsesTrouvees = 0;
  let mauvaisesReponsesChoisies = 0;

  // Analyse des choix de l'utilisateur
  userSelections.forEach(index => {
    if (q.correctIndex.includes(index)) {
      bonnesReponsesTrouvees++;
    } else {
      mauvaisesReponsesChoisies++;
    }
  });

  // Incohérences manquées (non détectées)
  q.correctIndex.forEach(i => {
    if (!userSelections.includes(i)) {
      fetch(API_BASE + '/api/stats/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: 'incoherence', label: q.options[i] })
      }).catch(() => {});
    }
  });

  // Calcul du score gagné sur cette question
  let pointsGagnes = bonnesReponsesTrouvees * 5;
  score += bonnesReponsesTrouvees; // Pour le total final

  // Envoi au score global (localStorage)
  const globalScore = parseInt(localStorage.getItem('globalScore')) || 0;
  localStorage.setItem('globalScore', globalScore + pointsGagnes);
  
  // Si tu as la fonction animée ajouterPoints() dans apprentissage.js :
  if (typeof ajouterPoints === "function" && pointsGagnes > 0) {
    ajouterPoints(pointsGagnes);
  }

  // Logique des messages
  let feedbackMsg = "";
  const feedbackDiv = document.getElementById('feedback');
  const toutTrouve = (bonnesReponsesTrouvees === q.correctIndex.length) && (mauvaisesReponsesChoisies === 0);

  if (toutTrouve) {
    feedbackDiv.style.backgroundColor = "rgba(46, 204, 113, 0.2)";
    feedbackMsg = `✅ Parfait ! Tu as trouvé toutes les incohérences. (+${pointsGagnes} pts)`;
  } else if (bonnesReponsesTrouvees > 0) {
    feedbackDiv.style.backgroundColor = "rgba(155, 89, 182, 0.2)";
    feedbackMsg = `👏 Bravo, mais tu n'as pas trouvé toutes les incohérences. (+${pointsGagnes} pts)`;
  } else {
    feedbackDiv.style.backgroundColor = "rgba(231, 76, 60, 0.2)";
    feedbackMsg = "❌ Dommage... Voici ce qu'il fallait trouver.";
  }

  // Coloration finale des boutons (Vert = solution, Rouge = erreur)
  boutons.forEach((btn, index) => {
    if (q.correctIndex.includes(index)) {
      btn.style.borderColor = "#2ecc71";
      btn.style.color = "#2ecc71";
    } else if (userSelections.includes(index)) {
      btn.style.borderColor = "#e74c3c";
      btn.style.color = "#e74c3c";
    }
  });

  document.getElementById('feedback-text').innerHTML = feedbackMsg;
  feedbackDiv.classList.remove('hidden');
}

// 5. Fonctions pour le Zoom Image (Modal)
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

// 6. Question suivante ou fin
function nextQuestion() {
  currentIndex++;
  renderQuestion();
}

function showEndScreen() {
  // Sauvegarde de la progression
  const progression = JSON.parse(localStorage.getItem('progression')) || {};
  progression.incoherence = 'TERMINÉ';
  localStorage.setItem('progression', JSON.stringify(progression));

  const pct = Math.round((score / totalIncoherencesPossibles) * 100);
  let mention = pct === 100 ? 'Expert de l\'IA ! 🏆' : (pct >= 50 ? 'Bien joué ! 👍' : 'Entraîne-toi encore ! 💪');

  document.querySelector('.card-container').innerHTML = `
    <div class="end-screen" style="text-align: center; padding: 20px;">
      <h2>Analyse terminée</h2>
      <p>Incohérences débusquées :</p>
      <div class="end-score" style="font-size: 3em; color: #b026ff; margin: 15px 0;">${score}<span>/${totalIncoherencesPossibles}</span></div>
      <p style="font-size: 1.2em; margin-bottom: 25px;">${mention}</p>
      <a href="apprentissage.html" class="next-btn" style="text-decoration: none; display: inline-block;">Retour au menu</a>
    </div>`;

    // Sauvegarde du score sur le backend
  const pseudo = sessionStorage.getItem('pseudo');
  if (pseudo) {
    fetch(API_BASE + '/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pseudo, quizId: 'incoherence', score, totalQuestions: totalIncoherencesPossibles })
    }).catch(() => {});
  }
}