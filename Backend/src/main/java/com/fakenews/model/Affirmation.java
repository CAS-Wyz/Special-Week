package com.fakenews.model;

/**
 * Représente une affirmation du chatbot (vraie ou fausse).
 * 
 * Exemple JSON :
 * {
 *   "id": 1,
 *   "texte": "La Grande Muraille est visible depuis l'espace.",
 *   "estVrai": false,
 *   "explication": "C'est un mythe, elle est trop étroite."
 * }
 */
public class Affirmation {
    
    private int id;
    private String texte;
    private boolean estVrai;
    private String explication;
    private String categorie; // ex: "science", "histoire", "geographie"

    // Constructeur vide
    public Affirmation() {}

    // Constructeur complet
    public Affirmation(int id, String texte, boolean estVrai, String explication) {
        this.id = id;
        this.texte = texte;
        this.estVrai = estVrai;
        this.explication = explication;
    }

    // Getters et Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTexte() {
        return texte;
    }

    public void setTexte(String texte) {
        this.texte = texte;
    }

    public boolean isEstVrai() {
        return estVrai;
    }

    public void setEstVrai(boolean estVrai) {
        this.estVrai = estVrai;
    }

    public String getExplication() {
        return explication;
    }

    public void setExplication(String explication) {
        this.explication = explication;
    }

    public String getCategorie() {
        return categorie;
    }

    public void setCategorie(String categorie) {
        this.categorie = categorie;
    }
}
