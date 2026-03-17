
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

// On lance le chargement au démarrage
window.addEventListener('DOMContentLoaded', () => {
    chargerScore();
    chargerBadges(); // La fonction pour les niveaux de l'étape précédente
}); // 1. Définition de la progression initiale si c'est la première visite
if (!localStorage.getItem('progression')) {
    const debutProgression = {
        quiz: "NOUVEAU",
        incoherence: "NIVEAU 1",
        fakeOrReal: "NOUVEAU"
    };
    localStorage.setItem('progression', JSON.stringify(debutProgression));
}

// 2. Fonction pour afficher la progression sur la page
function chargerBadges() {
    const data = JSON.parse(localStorage.getItem('progression'));

    // Mise à jour du Quiz
    const badgeQuiz = document.getElementById('badge-quiz');
    badgeQuiz.innerText = data.quiz;
    if(data.quiz === "TERMINÉ") badgeQuiz.classList.add('completed');

    // Mise à jour de l'Incohérence
    const badgeInc = document.getElementById('badge-incoherence');
    badgeInc.innerText = data.incoherence;
    // Si c'est un niveau numérique, tu peux ajouter une logique ici
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