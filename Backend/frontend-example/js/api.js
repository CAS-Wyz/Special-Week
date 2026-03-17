/**
 * api.js - Service pour connecter ton frontend HTML/JS au backend Spring Boot
 * 
 * Ajoute ce fichier dans ton dossier frontend/js/
 * Puis importe-le dans tes pages HTML
 */

// URL de ton backend (change pour Azure en production)
const API_URL = 'http://localhost:8080/api';

// ============================================
// QUIZ
// ============================================

/**
 * Récupère un quiz par son ID
 * @param {string} quizId - 'partie1', 'partie2', 'partie3', 'partie4', ou 'general'
 */
async function getQuiz(quizId) {
    try {
        const response = await fetch(`${API_URL}/quiz/${quizId}`);
        if (!response.ok) {
            throw new Error('Quiz non trouvé');
        }
        return await response.json();
    } catch (error) {
        console.error('Erreur chargement quiz:', error);
        return null;
    }
}

/**
 * Récupère tous les quiz disponibles
 */
async function getAllQuizzes() {
    try {
        const response = await fetch(`${API_URL}/quiz`);
        return await response.json();
    } catch (error) {
        console.error('Erreur chargement quiz:', error);
        return null;
    }
}

// ============================================
// CHATBOT
// ============================================

/**
 * Récupère une nouvelle affirmation du chatbot
 */
async function getAffirmation() {
    try {
        const response = await fetch(`${API_URL}/chatbot/affirmation`);
        return await response.json();
    } catch (error) {
        console.error('Erreur chatbot:', error);
        return null;
    }
}

/**
 * Vérifie la réponse de l'utilisateur
 * @param {number} affirmationId - L'ID de l'affirmation
 * @param {boolean} reponse - true si l'utilisateur pense que c'est vrai
 */
async function verifierReponse(affirmationId, reponse) {
    try {
        const response = await fetch(`${API_URL}/chatbot/verifier`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                affirmationId: affirmationId,
                reponse: reponse
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Erreur vérification:', error);
        return null;
    }
}

/**
 * Réinitialise la session du chatbot
 */
async function resetChatbot() {
    try {
        const response = await fetch(`${API_URL}/chatbot/reset`, {
            method: 'POST'
        });
        return await response.json();
    } catch (error) {
        console.error('Erreur reset:', error);
        return null;
    }
}

// ============================================
// SCORES
// ============================================

/**
 * Sauvegarde un score
 * @param {string} pseudo - Le pseudo du joueur
 * @param {string} quizId - L'ID du quiz
 * @param {number} score - Le nombre de bonnes réponses
 * @param {number} totalQuestions - Le nombre total de questions
 */
async function sauvegarderScore(pseudo, quizId, score, totalQuestions) {
    try {
        const response = await fetch(`${API_URL}/scores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pseudo: pseudo,
                quizId: quizId,
                score: score,
                totalQuestions: totalQuestions
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Erreur sauvegarde score:', error);
        return null;
    }
}

/**
 * Récupère le top 10 d'un quiz
 * @param {string} quizId - L'ID du quiz
 */
async function getTop10(quizId) {
    try {
        const response = await fetch(`${API_URL}/scores/top/${quizId}`);
        return await response.json();
    } catch (error) {
        console.error('Erreur chargement scores:', error);
        return [];
    }
}

// ============================================
// EXEMPLES D'UTILISATION
// ============================================

/*
// Dans ta page quiz.html :

// Charger le quiz partie 1
const quiz = await getQuiz('partie1');
console.log(quiz.title);
console.log(quiz.questions);

// Afficher les questions
quiz.questions.forEach((q, index) => {
    console.log(`Question ${index + 1}: ${q.question}`);
    q.options.forEach((opt, i) => {
        console.log(`  ${i + 1}. ${opt}`);
    });
});


// Dans ta page chatbot.html :

// Obtenir une affirmation
const affirmation = await getAffirmation();
console.log(affirmation.messageChatbot);

// L'utilisateur clique sur "Vrai"
const resultat = await verifierReponse(affirmation.id, true);
console.log(resultat.correct ? '✅ Bravo !' : '❌ Raté !');
console.log(resultat.explication);


// Sauvegarder un score
await sauvegarderScore('MonPseudo', 'partie1', 4, 5);

// Afficher le classement
const top10 = await getTop10('partie1');
top10.forEach((score, i) => {
    console.log(`${i + 1}. ${score.pseudo} - ${score.score}/${score.totalQuestions}`);
});
*/
