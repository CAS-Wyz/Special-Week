let questions = [];
let currentIndex = 0;
let score = 0; // On va compter le nombre d'incohérences trouvées au total
let totalIncoherencesPossibles = 0; // Pour l'écran de fin
let userSelections = []; 

// 1. Récupération des données JSON
fetch('../data/incoherences.json')
  .then(r => r.json())
  .then(data => {
    questions = data.incoherences;
    
    // On calcule le nombre TOTAL de bonnes réponses possibles dans tout le jeu
    questions.forEach(q => {
      totalIncoherencesPossibles += q.correctIndex.length;
    });

    renderQuestion();
  })
  .catch(error => console.error("Erreur lors du chargement du JSON :", error));

// 2. Affichage de la question
function renderQuestion() {
  if (currentIndex >= questions.length) {
    showEndScreen();
    return;
  }

  const q = questions[currentIndex];
  userSelections = [];

  document.getElementById('progress-bar').innerHTML = `Question <span id="current-q">${currentIndex + 1}</span>/${questions.length}`;

  document.getElementById('feedback').classList.add('hidden');
  document.getElementById('valider-btn').classList.remove('hidden');
  document.getElementById('options-grid').classList.remove('hidden');

  const imageDisplay = document.getElementById('image-display');
  imageDisplay.innerHTML = '';

  if (q.type === 'image') {
    const img = document.createElement('img');
    img.alt = 'À analyser';
    img.src = q.chemin;
    img.style.maxHeight = '300px';
    img.style.borderRadius = '8px';
    imageDisplay.appendChild(img);
  } else if (q.type === 'texte') {
    const p = document.createElement('p');
    p.className = 'challenge-text';
    p.textContent = `"${q.texte}"`;
    imageDisplay.appendChild(p);
  }

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

// 3. Gestion des clics sur les boutons
function toggleSelection(btn, index) {
  if (userSelections.includes(index)) {
    userSelections = userSelections.filter(i => i !== index);
    btn.classList.remove('selected');
  } else {
    userSelections.push(index);
    btn.classList.add('selected');
  }
}

// 4. Vérification de la réponse avec points par bonne sélection
function checkAnswer() {
  const q = questions[currentIndex];
  const boutons = document.querySelectorAll('.option-btn');
  
  document.getElementById('valider-btn').classList.add('hidden');
  boutons.forEach(btn => btn.disabled = true);

  let bonnesReponsesTrouvees = 0;
  let mauvaisesReponsesChoisies = 0;

  // On compte ce que l'utilisateur a juste ou faux
  userSelections.forEach(index => {
    if (q.correctIndex.includes(index)) {
      bonnesReponsesTrouvees++;
    } else {
      mauvaisesReponsesChoisies++;
    }
  });

  // Calcul des points (5 points par bonne réponse trouvée)
  let pointsGagnes = bonnesReponsesTrouvees * 5;
  
  // On ajoute au score local (pour l'écran de fin)
  score += bonnesReponsesTrouvees;

  // On ajoute au score global via ta fonction dans apprentissage.js
  if (pointsGagnes > 0) {
    if (typeof ajouterPoints === "function") {
      ajouterPoints(pointsGagnes);
    } else {
      // Sécurité si la fonction n'est pas trouvée
      const globalScore = parseInt(localStorage.getItem('globalScore')) || 0;
      localStorage.setItem('globalScore', globalScore + pointsGagnes);
    }
  }

  let feedbackMsg = "";
  const feedbackDiv = document.getElementById('feedback');

  // Détermination du message
  const toutTrouve = (bonnesReponsesTrouvees === q.correctIndex.length) && (mauvaisesReponsesChoisies === 0);

  if (toutTrouve) {
    feedbackDiv.className = "feedback-success";
    feedbackMsg = `✅ Parfait ! Tu as trouvé toutes les incohérences. (+${pointsGagnes} pts)`;
  } else if (bonnesReponsesTrouvees > 0) {
    feedbackDiv.className = "feedback-neutral";
    feedbackMsg = `👏 Bravo, mais tu n'as pas trouvé toutes les incohérences. (+${pointsGagnes} pts)`;
  } else {
    feedbackDiv.className = "feedback-neutral"; // Tu peux créer une classe feedback-error si tu veux
    feedbackMsg = "❌ Raté... Voici les bonnes réponses en vert.";
  }

  // Colorer les boutons pour montrer la solution
  boutons.forEach((btn, index) => {
    if (q.correctIndex.includes(index)) {
      btn.style.borderColor = "#2ecc71"; // Les vraies bonnes réponses en vert
      btn.style.color = "#2ecc71";
    } else if (userSelections.includes(index) && !q.correctIndex.includes(index)) {
      btn.style.borderColor = "#e74c3c"; // Les mauvais choix en rouge
      btn.style.color = "#e74c3c";
    }
  });

  document.getElementById('feedback-text').innerHTML = feedbackMsg;
  feedbackDiv.classList.remove('hidden');
}

// 5. Passer à la question suivante
function nextQuestion() {
  currentIndex++;
  renderQuestion();
}

// 6. Écran de fin adapté au nouveau système de score
function showEndScreen() {
  const progression = JSON.parse(localStorage.getItem('progression')) || {};
  progression.incoherence = 'TERMINÉ';
  localStorage.setItem('progression', JSON.stringify(progression));

  const pct = Math.round((score / totalIncoherencesPossibles) * 100);
  let mention = '';
  if (pct === 100) mention = 'Œil de lynx ! Parfait ! 👁️🏆';
  else if (pct >= 50) mention = 'Bien joué, tu as l\'œil ! 👍';
  else mention = 'Il faut être plus attentif aux détails ! 🔍';

  document.querySelector('.card-container').innerHTML =
    `<div class="end-screen" style="text-align: center;">
      <h2>Résultat final</h2>
      <p style="color: #8b7a9f; margin-top: 10px;">Incohérences débusquées :</p>
      <div class="end-score" style="font-size: 2em; color: #b026ff; margin: 10px 0;">
        ${score}<span> / ${totalIncoherencesPossibles}</span>
      </div>
      <p class="end-mention" style="font-size: 1.2em; margin-bottom: 30px;">${mention}</p>
      <a href="apprentissage.html" class="next-btn" style="text-decoration: none;">Retour aux jeux</a>
    </div>`;
}