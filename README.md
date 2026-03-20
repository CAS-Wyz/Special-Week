# Clairvo'lAnce — Plateforme éducative sur l'IA et les Fake News

Application web full-stack interactive permettant à des étudiants d'apprendre à détecter les fake news et à comprendre l'intelligence artificielle à travers des jeux et des quiz.

---

## Stack technique

| Couche | Technologies |
|---|---|
| **Backend** | Java 17, Spring Boot 3.2, Maven |
| **Frontend** | HTML5, CSS3, JavaScript vanilla, Chart.js |
| **Données** | JSON (fichiers statiques chargés au démarrage) |
| **Serveur web** | Nginx (reverse proxy + fichiers statiques) |
| **Containerisation** | Docker, Docker Compose |
| **Déploiement** | Azure Container Registry + Azure App Service |

---

## Architecture

```
Navigateur
    │
    ▼
Nginx (port 8081)
 ├── Sert les fichiers statiques du frontend
 └── Proxifie /api/* vers le backend
         │
         ▼
Spring Boot API (port 8080)
 ├── Charge quizzes.json au démarrage (QuizService)
 ├── Charge affirmations.json au démarrage (ChatbotService)
 ├── Stocke les scores dans /home/scores.json (ScoreService)
 └── Suit la présence des utilisateurs (PresenceService)
```

Le frontend communique exclusivement via `fetch()` vers l'API REST. Aucun framework JS n'est utilisé côté client — tout est en JavaScript vanilla.

---

## Fonctionnalités principales

### Jeux d'apprentissage

**Quiz Intégral**
Quiz de 20 questions réparties sur 4 modules thématiques (définition de l'IA, histoire de l'IA, fake news, esprit critique). Format QCM avec 4 choix, correction immédiate et explication après chaque réponse.

**FakeBot**
Chatbot simulant une IA qui énonce des affirmations vraies ou fausses. Le joueur doit deviner si chaque affirmation est vraie ou fausse, puis reçoit une explication. Le service gère un état de session pour éviter la répétition des affirmations.

**Fake or Real**
Jeu de détection d'images générées par IA. Le joueur doit identifier si une image est réelle ou produite par une IA, avec explication pédagogique.

**Détection d'Incohérences**
Exercice de logique où le joueur identifie des contradictions et raisonnements fallacieux pour développer l'esprit critique.

### Système de scores et classement

- Chaque joueur choisit un pseudonyme avant de jouer (géré par `pseudo.js`)
- Les scores sont envoyés à l'API via `POST /api/scores` et persistés dans un fichier JSON sur le volume Azure
- Le classement (`/api/scores/top/{id}`) affiche le top 10 par quiz

### Tableau de bord Admin

Accessible via une clé d'administration (`ADMIN_KEY`), le dashboard affiche :
- Nombre d'utilisateurs en ligne (suivi de présence en temps réel)
- Total de joueurs et scores moyens
- Graphiques Chart.js d'engagement

### Documentation pédagogique

4 modules de contenu éducatif accessibles sans compte :
- Module 1 : Définitions de l'IA
- Module 2 : Histoire de l'IA
- Module 3 : Fake news et méthodes de détection
- Module 4 : Esprit critique et pensée analytique

---

## Endpoints API

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/quiz` | Liste tous les quiz |
| GET | `/api/quiz/{id}` | Quiz complet avec questions |
| GET | `/api/quiz/{id}/questions` | Questions sans réponses |
| GET | `/api/chatbot/affirmation` | Affirmation aléatoire |
| POST | `/api/chatbot/verifier` | Vérifie une réponse |
| POST | `/api/chatbot/reset` | Réinitialise la session |
| GET | `/api/scores` | Tous les scores |
| POST | `/api/scores` | Enregistre un score |
| GET | `/api/scores/top/{id}` | Top 10 d'un quiz |
| GET | `/api/scores/joueur/{pseudo}` | Scores d'un joueur |
| GET | `/api/presence/*` | Suivi présence utilisateurs |
| GET | `/api/stats/*` | Statistiques admin |

---

## Modèles de données

```json
// Quiz
{ "id": "general", "title": "...", "questions": [...] }

// Question
{ "id": "q1", "question": "...", "options": ["A","B","C","D"], "correctIndex": 2, "explanation": "..." }

// Affirmation (FakeBot)
{ "id": 1, "texte": "...", "estVrai": true, "explication": "...", "categorie": "science" }

// Score
{ "id": "uuid", "pseudo": "Alice", "quizId": "general", "score": 17, "totalQuestions": 20, "date": "..." }
```

---

## Lancer le projet en local

**Prérequis** : Docker et Docker Compose installés.

```bash
# Cloner le dépôt
git clone <url>
cd "Spécial Week"

# Lancer toute la stack
docker-compose up --build

# Frontend accessible sur
http://localhost:8081

# API accessible sur
http://localhost:8081/api/
```

**Sans Docker** (développement) :

```bash
# Backend
cd Backend
mvn spring-boot:run
# API sur http://localhost:8080

# Frontend
# Servir "Site Web/" avec un serveur statique (Live Server VSCode, etc.)
```

---

## Déploiement Azure

Le script `deploy.sh` automatise :
1. Build des images Docker (backend + frontend)
2. Tag avec timestamp
3. Push vers Azure Container Registry (`specialweekacr.azurecr.io`)
4. Mise à jour des Azure App Services

```bash
./deploy.sh
```

Les services sont hébergés sur :
- Backend : `special-week-backend.azurewebsites.net`
- Frontend : `special-week-frontend.azurewebsites.net`

---

## Variables d'environnement

| Variable | Description | Défaut |
|---|---|---|
| `CORS_ALLOWED_ORIGINS` | Origines autorisées pour l'API | `http://localhost:5500` |
| `ADMIN_KEY` | Clé d'accès au dashboard admin | — |
| `API_URL` | URL de l'API (injectée dans le frontend Nginx) | — |

---

## Sécurité

- **CORS** : configuré dynamiquement via variable d'environnement
- **Rate Limiting** : `RateLimiterService` protège l'API contre les abus
- **Auth Admin** : clé secrète via variable d'environnement, jamais dans le code
- **Limites de taille** : requêtes limitées à 1 Mo

---

## Structure du projet

```
.
├── Backend/                    # API Spring Boot
│   ├── src/main/java/com/fakenews/
│   │   ├── controller/         # Contrôleurs REST
│   │   ├── service/            # Logique métier
│   │   ├── model/              # Modèles de données
│   │   └── config/             # CORS, configuration
│   └── src/main/resources/data/
│       ├── quizzes.json        # Questions des quiz
│       └── affirmations.json   # Affirmations du FakeBot
├── Site Web/                   # Frontend statique
│   ├── Accueil/                # Page d'accueil
│   ├── Apprentissage/          # Hub des jeux + quiz
│   ├── Fakebot/                # Jeu FakeBot
│   ├── Admin/                  # Dashboard admin
│   └── Documentation/          # Contenu pédagogique
├── docker-compose.yml
└── deploy.sh
```
