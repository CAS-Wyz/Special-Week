package com.fakenews.service;

import com.fakenews.model.Score;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.*;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service pour gérer les scores des utilisateurs.
 * Sauvegarde dans un fichier JSON.
 */
@Service
public class ScoreService {

    private List<Score> scores = new ArrayList<>();
    private final ObjectMapper objectMapper;
    private final String SCORES_FILE = System.getenv().getOrDefault("SCORES_PATH", "scores.json");

    public ScoreService() {
        this.objectMapper = new ObjectMapper();
        // Pour gérer les dates Java 8+
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    /**
     * Charge les scores existants au démarrage
     */
    @PostConstruct
    public void init() {
        File file = new File(SCORES_FILE);
        if (file.exists()) {
            try {
                scores = objectMapper.readValue(file, new TypeReference<List<Score>>() {});
                System.out.println("📊 " + scores.size() + " scores chargés");
            } catch (IOException e) {
                System.err.println("⚠️ Impossible de charger les scores : " + e.getMessage());
                scores = new ArrayList<>();
            }
        }
    }

    /**
     * Sauvegarde un nouveau score
     */
    public Score sauvegarderScore(Score score) {
        // Génère un ID unique
        score.setId(UUID.randomUUID().toString());
        scores.add(score);
        
        // Sauvegarde dans le fichier
        sauvegarderDansFichier();
        
        return score;
    }

    /**
     * Récupère tous les scores
     */
    public List<Score> getTousLesScores() {
        return scores;
    }

    /**
     * Récupère les scores pour un quiz spécifique
     */
    public List<Score> getScoresParQuiz(String quizId) {
        return scores.stream()
                .filter(s -> s.getQuizId().equals(quizId))
                .collect(Collectors.toMap(
                        Score::getPseudo,
                        s -> s,
                        (a, b) -> a.getDate().isAfter(b.getDate()) ? a : b
                ))
                .values().stream()
                .sorted((a, b) -> b.getScore() - a.getScore())
                .collect(Collectors.toList());
    }

    /**
     * Récupère le top 10 des meilleurs scores pour un quiz
     */
    public List<Score> getTop10(String quizId) {
        return getScoresParQuiz(quizId).stream()
                .limit(10)
                .collect(Collectors.toList());
    }

    /**
     * Récupère les scores d'un joueur
     */
    public List<Score> getScoresParJoueur(String pseudo) {
        return scores.stream()
                .filter(s -> s.getPseudo().equalsIgnoreCase(pseudo))
                .collect(Collectors.toList());
    }

    /**
     * Sauvegarde les scores dans le fichier JSON
     */
    private void sauvegarderDansFichier() {
        try {
            objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValue(new File(SCORES_FILE), scores);
        } catch (IOException e) {
            System.err.println("❌ Erreur sauvegarde scores : " + e.getMessage());
        }
    }
}
