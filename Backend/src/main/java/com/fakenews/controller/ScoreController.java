package com.fakenews.controller;

import com.fakenews.model.Score;
import com.fakenews.service.ScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @Autowired
    private ScoreService scoreService;

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
    public ResponseEntity<Score> saveScore(@RequestBody Score score) {
        Score saved = scoreService.sauvegarderScore(score);
        return ResponseEntity.ok(saved);
    }
}
