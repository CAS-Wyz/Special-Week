package com.fakenews.controller;

import com.fakenews.model.Quiz;
import com.fakenews.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller REST pour les Quiz.
 * 
 * Endpoints :
 * - GET /api/quiz          → Liste tous les quiz
 * - GET /api/quiz/{id}     → Récupère un quiz par ID
 */
@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    @Autowired
    private QuizService quizService;

    /**
     * GET /api/quiz
     * Retourne la liste de tous les quiz disponibles
     */
    @GetMapping
    public ResponseEntity<Map<String, Quiz>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    /**
     * GET /api/quiz/{id}
     * Retourne un quiz spécifique
     * 
     * Exemples :
     * - /api/quiz/partie1
     * - /api/quiz/partie2
     * - /api/quiz/general
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getQuizById(@PathVariable String id) {
        Quiz quiz = quizService.getQuizById(id);
        
        if (quiz == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(quiz);
    }

    /**
     * GET /api/quiz/{id}/questions
     * Retourne uniquement les questions d'un quiz (sans les réponses pour tricher 😉)
     * 
     * Note : Pour un vrai projet, tu voudrais peut-être cacher correctIndex
     */
    @GetMapping("/{id}/questions")
    public ResponseEntity<?> getQuizQuestions(@PathVariable String id) {
        Quiz quiz = quizService.getQuizById(id);
        
        if (quiz == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(quiz.getQuestions());
    }
}
