package com.fakenews.controller;

import com.fakenews.service.PresenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/presence")
public class PresenceController {

    @Autowired
    private PresenceService presenceService;

    /**
     * POST /api/presence/ping
     * Body : { "pseudo": "Alice" }
     * Met à jour la présence du joueur.
     */
    @PostMapping("/ping")
    public ResponseEntity<?> ping(@RequestBody Map<String, String> body) {
        String pseudo = body.get("pseudo");
        try {
            presenceService.ping(pseudo);
            return ResponseEntity.ok(Map.of("status", "ok"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage()));
        }
    }

    /**
     * GET /api/presence/online
     * Retourne la liste des pseudos en ligne (actifs dans les 60 dernières secondes).
     */
    @GetMapping("/online")
    public ResponseEntity<List<String>> getOnline() {
        return ResponseEntity.ok(presenceService.getOnlinePlayers());
    }
}
