package com.fakenews.service;

import com.fakenews.model.Affirmation;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.*;

/**
 * Service "Pseudo-IA" pour le chatbot.
 * 
 * Simule une IA qui fait des affirmations vraies ou fausses.
 * L'utilisateur doit deviner si c'est vrai ou faux.
 */
@Service
public class ChatbotService {

    private List<Affirmation> affirmations = new ArrayList<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Random random = new Random();
    
    // Pour éviter de répéter les mêmes affirmations
    private Set<Integer> affirmationsUtilisees = new HashSet<>();

    /**
     * Charge les affirmations au démarrage
     */
    @PostConstruct
    public void init() {
        try {
            ClassPathResource resource = new ClassPathResource("data/affirmations.json");
            JsonNode root = objectMapper.readTree(resource.getInputStream());
            
            affirmations = objectMapper.convertValue(
                root.get("affirmations"), 
                new TypeReference<List<Affirmation>>() {}
            );
            
            System.out.println("🤖 Chatbot : " + affirmations.size() + " affirmations chargées");
            
        } catch (IOException e) {
            System.err.println("❌ Impossible de charger affirmations.json : " + e.getMessage());
            // Charge des affirmations par défaut si le fichier n'existe pas
            chargerAffirmationsParDefaut();
        }
    }

    /**
     * Retourne une affirmation aléatoire (non encore utilisée si possible)
     */
    public Affirmation getAffirmationAleatoire() {
        if (affirmations.isEmpty()) {
            return null;
        }
        
        // Si toutes les affirmations ont été utilisées, on réinitialise
        if (affirmationsUtilisees.size() >= affirmations.size()) {
            affirmationsUtilisees.clear();
        }
        
        // Trouve une affirmation non utilisée
        Affirmation affirmation;
        int index;
        do {
            index = random.nextInt(affirmations.size());
            affirmation = affirmations.get(index);
        } while (affirmationsUtilisees.contains(index) && affirmationsUtilisees.size() < affirmations.size());
        
        affirmationsUtilisees.add(index);
        return affirmation;
    }

    /**
     * Vérifie la réponse de l'utilisateur
     * 
     * @param affirmationId L'ID de l'affirmation
     * @param reponseUtilisateur true si l'utilisateur pense que c'est vrai
     * @return Un objet avec le résultat et l'explication
     */
    public Map<String, Object> verifierReponse(int affirmationId, boolean reponseUtilisateur) {
        Map<String, Object> resultat = new HashMap<>();
        
        // Trouve l'affirmation
        Optional<Affirmation> affOpt = affirmations.stream()
                .filter(a -> a.getId() == affirmationId)
                .findFirst();
        
        if (affOpt.isEmpty()) {
            resultat.put("erreur", "Affirmation non trouvée");
            return resultat;
        }
        
        Affirmation affirmation = affOpt.get();
        boolean correct = (affirmation.isEstVrai() == reponseUtilisateur);
        
        resultat.put("correct", correct);
        resultat.put("laVerite", affirmation.isEstVrai());
        resultat.put("explication", affirmation.getExplication());
        
        // Message personnalisé de la "pseudo-IA"
        if (correct) {
            resultat.put("messageChatbot", "Bravo ! Tu as bien détecté que c'était " + 
                (affirmation.isEstVrai() ? "vrai" : "faux") + ". 🎉");
        } else {
            resultat.put("messageChatbot", "Raté ! En fait, c'était " + 
                (affirmation.isEstVrai() ? "vrai" : "faux") + ". " +
                "Même les IA peuvent induire en erreur ! 🤖");
        }
        
        return resultat;
    }

    /**
     * Réinitialise les affirmations utilisées (pour recommencer une session)
     */
    public void reinitialiserSession() {
        affirmationsUtilisees.clear();
    }

    /**
     * Affirmations par défaut si le fichier JSON n'existe pas
     */
    private void chargerAffirmationsParDefaut() {
        affirmations.add(new Affirmation(1, 
            "La Grande Muraille de Chine est visible depuis l'espace à l'œil nu.", 
            false, 
            "C'est un mythe populaire. La muraille est trop étroite (environ 6 mètres) pour être vue depuis l'orbite terrestre sans aide optique."));
        
        affirmations.add(new Affirmation(2, 
            "Le miel est le seul aliment qui ne périme jamais.", 
            true, 
            "Grâce à sa faible teneur en eau et ses propriétés antibactériennes, le miel peut se conserver indéfiniment s'il est stocké correctement."));
        
        affirmations.add(new Affirmation(3, 
            "Les humains n'utilisent que 10% de leur cerveau.", 
            false, 
            "C'est un mythe. Les scanners cérébraux montrent que nous utilisons la totalité de notre cerveau, même si pas toutes les zones en même temps."));
        
        System.out.println("⚠️ Chargement des affirmations par défaut (3 affirmations)");
    }
}
