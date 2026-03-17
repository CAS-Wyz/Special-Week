package com.fakenews.service;

import com.fakenews.model.Quiz;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Service qui gère les quiz.
 * Charge les données depuis le fichier JSON au démarrage.
 */
@Service
public class QuizService {

    // Stocke tous les quiz en mémoire
    private Map<String, Quiz> quizzes = new HashMap<>();
    
    // ObjectMapper pour lire le JSON
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Cette méthode s'exécute au démarrage de l'application.
     * Elle charge le fichier quizzes.json
     */
    @PostConstruct
    public void init() {
        try {
            // Charge le fichier depuis resources/data/quizzes.json
            ClassPathResource resource = new ClassPathResource("data/quizzes.json");
            
            // Parse le JSON
            JsonNode root = objectMapper.readTree(resource.getInputStream());
            JsonNode quizzesNode = root.get("quizzes");
            
            // Parcourt chaque quiz (partie1, partie2, etc.)
            quizzesNode.fieldNames().forEachRemaining(key -> {
                try {
                    Quiz quiz = objectMapper.treeToValue(quizzesNode.get(key), Quiz.class);
                    quizzes.put(key, quiz);
                    System.out.println("✅ Quiz chargé : " + key + " (" + quiz.getQuestionsCount() + " questions)");
                } catch (Exception e) {
                    System.err.println("❌ Erreur chargement quiz " + key + ": " + e.getMessage());
                }
            });
            
            System.out.println("📚 Total : " + quizzes.size() + " quiz chargés");
            
        } catch (IOException e) {
            System.err.println("❌ Impossible de charger quizzes.json : " + e.getMessage());
        }
    }

    /**
     * Récupère un quiz par son ID (partie1, partie2, general, etc.)
     */
    public Quiz getQuizById(String id) {
        return quizzes.get(id);
    }

    /**
     * Récupère tous les quiz disponibles
     */
    public Map<String, Quiz> getAllQuizzes() {
        return quizzes;
    }

    /**
     * Vérifie si un quiz existe
     */
    public boolean quizExists(String id) {
        return quizzes.containsKey(id);
    }
}
