package com.fakenews.controller;

import com.fakenews.model.Score;
import com.fakenews.service.RateLimiterService;
import com.fakenews.service.ScoreService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Controller REST pour les Scores.
 * 
 * Endpoints :
 * - GET  /api/scores              → Liste tous les scores
 * - GET  /api/scores/quiz/{id}    → Scores pour un quiz
 * - GET  /api/scores/top/{id}     → Top 10 d'un quiz
 * - POST /api/scores              → Sauvegarder un score
 */
@RestController
@RequestMapping("/api/scores")
public class ScoreController {

    private static final Logger log = LoggerFactory.getLogger(ScoreController.class);
    private static final Set<String> QUIZ_IDS_VALIDES = Set.of("general", "fakeoureel", "incoherence");

    @Autowired
    private ScoreService scoreService;

    @Autowired
    private RateLimiterService rateLimiter;

    /**
     * GET /api/scores
     * Retourne tous les scores
     */
    @GetMapping
    public ResponseEntity<List<Score>> getAllScores() {
        return ResponseEntity.ok(scoreService.getTousLesScores());
    }

    /**
     * GET /api/scores/quiz/{quizId}
     * Retourne les scores pour un quiz spécifique
     */
    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<Score>> getScoresByQuiz(@PathVariable String quizId) {
        return ResponseEntity.ok(scoreService.getScoresParQuiz(quizId));
    }

    /**
     * GET /api/scores/top/{quizId}
     * Retourne le top 10 pour un quiz
     */
    @GetMapping("/top/{quizId}")
    public ResponseEntity<List<Score>> getTop10(@PathVariable String quizId) {
        return ResponseEntity.ok(scoreService.getTop10(quizId));
    }

    /**
     * GET /api/scores/joueur/{pseudo}
     * Retourne les scores d'un joueur
     */
    @GetMapping("/joueur/{pseudo}")
    public ResponseEntity<List<Score>> getScoresByPlayer(@PathVariable String pseudo) {
        return ResponseEntity.ok(scoreService.getScoresParJoueur(pseudo));
    }

    /**
     * POST /api/scores
     * Sauvegarde un nouveau score
     * 
     * Body JSON attendu :
     * {
     *   "pseudo": "John",
     *   "quizId": "partie1",
     *   "score": 4,
     *   "totalQuestions": 5
     * }
     */
    @PostMapping
    public ResponseEntity<?> saveScore(@RequestBody Score score, HttpServletRequest request) {
        String ip = request.getRemoteAddr();

        // Rate limiting : max 10 soumissions par IP par 5 minutes
        if (!rateLimiter.isAllowed("score:" + ip, 10, 5 * 60 * 1000)) {
            log.warn("Rate limit score dépassé pour {}", ip);
            return ResponseEntity.status(429).body(Map.of("erreur", "Trop de soumissions. Réessaie dans quelques minutes."));
        }

        // Validation du pseudo
        if (score.getPseudo() == null || score.getPseudo().isBlank() || score.getPseudo().length() > 20) {
            log.warn("Score refusé - pseudo invalide depuis {}", ip);
            return ResponseEntity.badRequest().body(Map.of("erreur", "Pseudo invalide."));
        }

        // Validation du quizId
        if (!QUIZ_IDS_VALIDES.contains(score.getQuizId())) {
            log.warn("Score refusé - quizId inconnu '{}' depuis {}", score.getQuizId(), ip);
            return ResponseEntity.badRequest().body(Map.of("erreur", "Quiz inconnu."));
        }

        // Validation des valeurs numériques
        if (score.getTotalQuestions() <= 0 || score.getTotalQuestions() > 100) {
            log.warn("Score refusé - totalQuestions invalide ({}) depuis {}", score.getTotalQuestions(), ip);
            return ResponseEntity.badRequest().body(Map.of("erreur", "Nombre de questions invalide."));
        }
        if (score.getScore() < 0 || score.getScore() > score.getTotalQuestions()) {
            log.warn("Score refusé - valeur invalide ({}/{}) depuis {}", score.getScore(), score.getTotalQuestions(), ip);
            return ResponseEntity.badRequest().body(Map.of("erreur", "Score invalide."));
        }

        Score saved = scoreService.sauvegarderScore(score);
        return ResponseEntity.ok(saved);
    }
}
