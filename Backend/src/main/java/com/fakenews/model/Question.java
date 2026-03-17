package com.fakenews.model;

import java.util.List;

/**
 * Représente une question de quiz.
 * 
 * Exemple JSON :
 * {
 *   "id": "p1q1",
 *   "question": "Qui a proposé le terme IA ?",
 *   "options": ["Turing", "McCarthy", "Gates", "Jobs"],
 *   "correctIndex": 1,
 *   "explanation": "John McCarthy en 1956"
 * }
 */
public class Question {
    
    private String id;
    private String question;
    private List<String> options;
    private int correctIndex;
    private String explanation;
    private String category; // Pour le quiz général

    // Constructeur vide (requis par Jackson pour lire le JSON)
    public Question() {}

    // Constructeur complet
    public Question(String id, String question, List<String> options, 
                    int correctIndex, String explanation) {
        this.id = id;
        this.question = question;
        this.options = options;
        this.correctIndex = correctIndex;
        this.explanation = explanation;
    }

    // Getters et Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public int getCorrectIndex() {
        return correctIndex;
    }

    public void setCorrectIndex(int correctIndex) {
        this.correctIndex = correctIndex;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
