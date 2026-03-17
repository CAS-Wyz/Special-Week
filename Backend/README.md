# 🚀 Backend IA & Fake News - Guide Débutant

## 📁 Structure du projet

```
backend-ia-fakenews/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── fakenews/
│       │           ├── FakeNewsApplication.java        ← Point d'entrée
│       │           ├── controller/
│       │           │   ├── QuizController.java         ← API Quiz
│       │           │   ├── ChatbotController.java      ← API Chatbot
│       │           │   └── ScoreController.java        ← API Scores
│       │           ├── service/
│       │           │   ├── QuizService.java
│       │           │   ├── ChatbotService.java
│       │           │   └── ScoreService.java
│       │           └── model/
│       │               ├── Question.java
│       │               ├── Affirmation.java
│       │               └── Score.java
│       └── resources/
│           ├── application.properties                  ← Configuration
│           └── data/
│               ├── quizzes.json                        ← Tes quiz
│               ├── affirmations.json                   ← Chatbot vrai/faux
│               └── scores.json                         ← Scores sauvegardés
├── pom.xml                                             ← Dépendances Maven
└── README.md
```

## 🛠️ Installation

### Prérequis
1. **Java 17+** : [Télécharger ici](https://adoptium.net/)
2. **Maven** : [Télécharger ici](https://maven.apache.org/download.cgi)
3. **VS Code** avec l'extension "Extension Pack for Java"

### Créer le projet
1. Va sur [Spring Initializr](https://start.spring.io/)
2. Configure :
   - Project: **Maven**
   - Language: **Java**
   - Spring Boot: **3.2.x**
   - Group: `com.fakenews`
   - Artifact: `backend`
   - Dependencies: **Spring Web**
3. Clique "Generate" et dézippe

### Lancer le projet
```bash
cd backend-ia-fakenews
mvn spring-boot:run
```
→ Le serveur démarre sur `http://localhost:8080`

## 📡 Endpoints API

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/quiz/{id}` | Récupère un quiz par son ID |
| GET | `/api/quiz/general` | Récupère le quiz général |
| POST | `/api/scores` | Sauvegarde un score |
| GET | `/api/scores` | Liste tous les scores |
| GET | `/api/chatbot/affirmation` | Affirmation aléatoire |
| POST | `/api/chatbot/verifier` | Vérifie la réponse |

## 🔗 Connexion Frontend ↔ Backend

Dans ton JavaScript, utilise `fetch()` pour appeler l'API :

```javascript
// Exemple : récupérer le quiz partie 1
fetch('http://localhost:8080/api/quiz/partie1')
  .then(response => response.json())
  .then(quiz => {
    console.log(quiz.questions);
    // Afficher les questions...
  });
```

## ☁️ Déploiement Azure

1. Crée une **Azure App Service** (Java 17)
2. Configure le déploiement depuis GitHub
3. L'URL sera : `https://ton-app.azurewebsites.net`

