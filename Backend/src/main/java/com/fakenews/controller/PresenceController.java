package com.fakenews.controller;

import com.fakenews.service.PresenceService;
import com.fakenews.service.RateLimiterService;
import jakarta.servlet.http.HttpServletRequest;
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

    @Autowired
    private RateLimiterService rateLimiter;

    /**
     * POST /api/presence/ping
     * Body : { "pseudo": "Alice" }
     * Met à jour la présence du joueur.
     */
    @PostMapping("/ping")
    public ResponseEntity<?> ping(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String ip = request.getRemoteAddr();

        // Rate limiting : max 5 pings par IP par minute
        if (!rateLimiter.isAllowed("ping:" + ip, 5, 60 * 1000)) {
            return ResponseEntity.status(429).body(Map.of("erreur", "Trop de requêtes."));
        }

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

    /**
     * POST /api/presence/leave
     * Body : { "pseudo": "Alice" }
     * Retire immédiatement le joueur de la présence.
     */
    @PostMapping("/leave")
    public ResponseEntity<?> leave(@RequestBody Map<String, String> body) {
        String pseudo = body.get("pseudo");
        if (pseudo != null) presenceService.removePlayer(pseudo);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
