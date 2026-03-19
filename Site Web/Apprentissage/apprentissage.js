
// 1. Fonction pour afficher le score au chargement de la page
function chargerScore() {
    // On récupère le score, s'il n'existe pas, on met 0
    let scoreActuel = localStorage.getItem('globalScore') || 0;
    document.getElementById('global-score-number').innerText = scoreActuel;
}

// 2. Fonction pour ajouter des points (à appeler depuis tes jeux)
// Exemple : ajouterPoints(100);
function ajouterPoints(points) {
    let scoreActuel = parseInt(localStorage.getItem('globalScore')) || 0;
    let nouveauScore = scoreActuel + points;
    
    // On enregistre le nouveau score
    localStorage.setItem('globalScore', nouveauScore);
    
    // On met à jour l'affichage sur la page
    const elementScore = document.getElementById('global-score-number');
    if(elementScore) {
        elementScore.innerText = nouveauScore;
    }
}

function resetScore() {
  localStorage.setItem('globalScore', 0);
  document.getElementById('global-score-number').innerText = 0;

  localStorage.setItem('progression', JSON.stringify({
    quiz: 'NOUVEAU',
    incoherence: 'NOUVEAU',
    fakeOrReal: 'NOUVEAU'
  }));
  chargerBadges();
}

// On lance le chargement au démarrage
window.addEventListener('DOMContentLoaded', () => {
    chargerScore();
    chargerBadges(); // La fonction pour les niveaux de l'étape précédente
}); // 1. Définition de la progression initiale si c'est la première visite
if (!localStorage.getItem('progression')) {
    const debutProgression = {
        quiz: "NOUVEAU",
        incoherence: "NOUVEAU",
        fakeOrReal: "NOUVEAU"
    };
    localStorage.setItem('progression', JSON.stringify(debutProgression));
}

// 2. Fonction pour afficher la progression sur la page
function chargerBadges() {
    const data = JSON.parse(localStorage.getItem('progression'));

    function setBadge(id, value) {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerText = value;
        el.classList.toggle('completed', value === 'TERMINÉ');
    }

    setBadge('badge-quiz', data.quiz);
    setBadge('badge-incoherence', data.incoherence);
    setBadge('badge-fakeoureel', data.fakeOrReal || 'NOUVEAU');
}

// Lancer le chargement au démarrage
window.onload = chargerBadges;

// --- FONCTION À APPELER QUAND TU GAGNES UN NIVEAU ---
// Tu l'utiliseras dans tes fichiers de jeux (ex: quiz.js)
function updateLevel(gameKey, nextValue) {
    let data = JSON.parse(localStorage.getItem('progression'));
    data[gameKey] = nextValue;
    localStorage.setItem('progression', JSON.stringify(data));
    chargerBadges(); // Rafraîchit l'affichage
}

// Tes données de jeu
const questions = [
  { src: 'images/img1.jpg', isAI: true, info: "C'est une IA ! Regarde bien le reflet dans les yeux." },
  { src: 'images/img2.jpg', isAI: false, info: "C'est une vraie photo prise par un photographe en 2024." },
  // Ajoute d'autres questions ici
];

let currentIndex = 0;
let correctAnswers = 0;

function checkAnswer(userChoiceIsAI) {
  const question = questions[currentIndex];
  const feedbackDiv = document.getElementById('feedback');
  const choicesDiv = document.getElementById('choices');
  
  choicesDiv.classList.add('hidden');
  feedbackDiv.classList.remove('hidden');

  if (userChoiceIsAI === question.isAI) {
    document.getElementById('feedback-text').innerText = "✅ Bravo ! " + question.info;
    correctAnswers++;
    ajouterPoints(100); // Utilise ta fonction de score global !
  } else {
    document.getElementById('feedback-text').innerText = "❌ Raté... " + question.info;
  }
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex < questions.length) {
    // Mise à jour de l'image et du compteur
    document.getElementById('game-image').src = questions[currentIndex].src;
    document.getElementById('current-q').innerText = currentIndex + 1;
    
    // Reset de l'affichage
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('choices').classList.remove('hidden');
  } else {
    // Fin du jeu
    finDeJeu();
  }
}

function finDeJeu() {
  document.querySelector('.card-container').innerHTML = `
    <h2>Jeu terminé !</h2>
    <p>Ton score pour ce jeu : ${correctAnswers}/${questions.length}</p>
    <button onclick="window.location.href='jeux.html'" class="next-btn">Retour aux jeux</button>
  `;
  
  // On met à jour le niveau dans la mémoire
  updateLevel('fakeOrReal', 'TERMINÉ');
}


  function selectAnswer(boutonClique, choix) {
    // 1. On enlève la classe 'selected' de tous les boutons
    let tousLesBoutons = document.querySelectorAll('.option-btn');
    tousLesBoutons.forEach(btn => btn.classList.remove('selected'));

    // 2. On ajoute la classe 'selected' au bouton cliqué
    boutonClique.classList.add('selected');

    // 3. On gère le message de retour (Feedback)
    let feedbackDiv = document.getElementById('feedback-message');
    feedbackDiv.classList.remove('hidden');
    
    // Exemple de logique simple (Tu pourras l'améliorer plus tard)
    // Ici, la bonne réponse pour mon texte d'exemple est "Contradiction" (navire dans le désert)
    let bonneReponse = "Contradiction";

    if (choix === bonneReponse) {
      feedbackDiv.className = "feedback-success"; // Classe CSS verte
      feedbackDiv.innerHTML = "<strong>Bravo !</strong> C'est exactement ça. Il y a une contradiction évidente dans le texte.";
    } else {
      feedbackDiv.className = "feedback-neutral"; // Classe CSS violette
      feedbackDiv.innerHTML = "Tu as sélectionné : <em>" + choix + "</em>. Es-tu sûr de ton choix ?";
    }
  }
