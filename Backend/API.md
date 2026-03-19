# 📡 Documentation API - Backend IA & Fake News

**Base URL :** `http://localhost:8080/api`

---

## 🎯 Quiz

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/quiz` | Liste tous les quiz disponibles |
| `GET` | `/quiz/{id}` | Récupère un quiz par son ID |
| `GET` | `/quiz/{id}/questions` | Récupère uniquement les questions |

### IDs disponibles
- `partie1` → Quiz Partie 1 (5 questions)
- `partie2` → Quiz Partie 2 (5 questions)
- `partie3` → Quiz Partie 3 (5 questions)
- `partie4` → Quiz Partie 4 (5 questions)
- `general` → Quiz Général (20 questions)

### Exemple de réponse
```json
GET /api/quiz/partie1

{
  "id": "ia-definition",
  "title": "Quiz - Qu'est-ce que l'IA ?",
  "description": "Testez vos connaissances...",
  "questionsCount": 5,
  "questions": [
    {
      "id": "p1q1",
      "question": "Qui a proposé le terme IA ?",
      "options": ["Turing", "McCarthy", "Gates", "Jobs"],
      "correctIndex": 1,
      "explanation": "John McCarthy en 1956"
    }
  ]
}
```

---

## 🤖 Chatbot

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/chatbot/affirmation` | Obtenir une affirmation aléatoire |
| `POST` | `/chatbot/verifier` | Vérifier la réponse de l'utilisateur |
| `POST` | `/chatbot/reset` | Réinitialiser la session |

### GET /chatbot/affirmation
```json
{
  "id": 1,
  "texte": "La Grande Muraille est visible depuis l'espace.",
  "messageChatbot": "🤖 Je suis certain que : \"...\" Es-tu d'accord ?"
}
```

### POST /chatbot/verifier
**Body :**
```json
{
  "affirmationId": 1,
  "reponse": true
}
```

**Réponse :**
```json
{
  "correct": false,
  "laVerite": false,
  "explication": "C'est un mythe populaire...",
  "messageChatbot": "Raté ! En fait, c'était faux. 🤖"
}
```

---

## 📊 Scores

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/scores` | Liste tous les scores |
| `GET` | `/scores/quiz/{quizId}` | Scores d'un quiz spécifique |
| `GET` | `/scores/top/{quizId}` | Top 10 d'un quiz |
| `GET` | `/scores/joueur/{pseudo}` | Scores d'un joueur |
| `POST` | `/scores` | Sauvegarder un score |

### POST /scores
**Body :**
```json
{
  "pseudo": "John",
  "quizId": "partie1",
  "score": 4,
  "totalQuestions": 5
}
```

**Réponse :**
```json
{
  "id": "uuid-généré",
  "pseudo": "John",
  "quizId": "partie1",
  "score": 4,
  "totalQuestions": 5,
  "pourcentage": 80,
  "date": "2025-03-19T14:30:00"
}
```

---

## ⚠️ Codes d'erreur

| Code | Signification |
|------|---------------|
| `200` | ✅ Succès |
| `404` | ❌ Ressource non trouvée |
| `400` | ❌ Paramètres manquants/invalides |
| `500` | ❌ Erreur serveur |

---

## 🔗 Exemples d'appels (JavaScript)

```javascript
// Récupérer un quiz
const quiz = await fetch('/api/quiz/partie1').then(r => r.json());

// Obtenir une affirmation
const affirmation = await fetch('/api/chatbot/affirmation').then(r => r.json());

// Vérifier une réponse
const resultat = await fetch('/api/chatbot/verifier', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ affirmationId: 1, reponse: true })
}).then(r => r.json());

// Sauvegarder un score
await fetch('/api/scores', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ pseudo: 'John', quizId: 'partie1', score: 4, totalQuestions: 5 })
});
```