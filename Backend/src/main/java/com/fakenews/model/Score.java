package com.fakenews.model;

import java.time.LocalDateTime;

/**
 * Représente le score d'un utilisateur sur un quiz.
 */
public class Score {
    
    private String id;
    private String pseudo;
    private String quizId;
    private int score;
    private int totalQuestions;
    private LocalDateTime date;

    // Constructeur vide
    public Score() {
        this.date = LocalDateTime.now();
    }

    // Constructeur complet
    public Score(String pseudo, String quizId, int score, int totalQuestions) {
        this.id = java.util.UUID.randomUUID().toString();
        this.pseudo = pseudo;
        this.quizId = quizId;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.date = LocalDateTime.now();
    }

    // Getters et Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPseudo() {
        return pseudo;
    }

    public void setPseudo(String pseudo) {
        this.pseudo = pseudo;
    }

    public String getQuizId() {
        return quizId;
    }

    public void setQuizId(String quizId) {
        this.quizId = quizId;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }
    
    // Calculer le pourcentage
    public int getPourcentage() {
        if (totalQuestions == 0) return 0;
        return (score * 100) / totalQuestions;
    }
}
