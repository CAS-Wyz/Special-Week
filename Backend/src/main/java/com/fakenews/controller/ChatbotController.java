package com.fakenews.controller;

import com.fakenews.model.Affirmation;
import com.fakenews.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller REST pour le Chatbot "Pseudo-IA".
 * 
 * Endpoints :
 * - GET  /api/chatbot/affirmation  → Obtenir une affirmation aléatoire
 * - POST /api/chatbot/verifier     → Vérifier la réponse de l'utilisateur
 * - POST /api/chatbot/reset        → Réinitialiser la session
 */
@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    /**
     * GET /api/chatbot/affirmation
     * 
     * Retourne une affirmation aléatoire que l'utilisateur doit juger vraie ou fausse.
     * Le chatbot "prétend" que c'est vrai, même si c'est faux !
     */
    @GetMapping("/affirmation")
    public ResponseEntity<?> getAffirmation() {
        Affirmation affirmation = chatbotService.getAffirmationAleatoire();
        
        if (affirmation == null) {
            return ResponseEntity.noContent().build();
        }
        
        // On retourne l'affirmation SANS révéler si c'est vrai ou faux
        // L'utilisateur doit deviner !
        return ResponseEntity.ok(Map.of(
            "id", affirmation.getId(),
            "texte", affirmation.getTexte(),
            "messageChatbot", "🤖 Je suis certain que : \"" + affirmation.getTexte() + "\" Es-tu d'accord avec moi ?"
        ));
    }

    /**
     * POST /api/chatbot/verifier
     * 
     * Vérifie si la réponse de l'utilisateur est correcte.
     * 
     * Body JSON attendu :
     * {
     *   "affirmationId": 1,
     *   "reponse": true   // true = l'utilisateur pense que c'est vrai
     * }
     */
    @PostMapping("/verifier")
    public ResponseEntity<?> verifierReponse(@RequestBody Map<String, Object> body) {
        
        // Récupère les paramètres
        Integer affirmationId = (Integer) body.get("affirmationId");
        Boolean reponseUtilisateur = (Boolean) body.get("reponse");
        
        if (affirmationId == null || reponseUtilisateur == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "erreur", "Paramètres manquants : affirmationId et reponse requis"
            ));
        }
        
        // Vérifie la réponse
        Map<String, Object> resultat = chatbotService.verifierReponse(affirmationId, reponseUtilisateur);
        
        return ResponseEntity.ok(resultat);
    }

    /**
     * POST /api/chatbot/reset
     * 
     * Réinitialise la session pour recommencer avec toutes les affirmations.
     */
    @PostMapping("/reset")
    public ResponseEntity<?> resetSession() {
        chatbotService.reinitialiserSession();
        return ResponseEntity.ok(Map.of(
            "message", "Session réinitialisée ! Prêt pour une nouvelle partie. 🎮"
        ));
    }
}
