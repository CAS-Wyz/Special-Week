package com.fakenews.controller;

import com.fakenews.model.Score;
import com.fakenews.service.ErrorTrackingService;
import com.fakenews.service.PresenceService;
import com.fakenews.service.ScoreService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Controller REST pour le dashboard admin.
 *
 * Endpoint :
 * - GET /api/admin/stats  →  Header requis : Authorization: Bearer <clé>
 *
 * Protégé par la clé ADMIN_KEY (variable d'env, défaut : "admin2025")
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private static final String ADMIN_KEY =
            System.getenv().getOrDefault("ADMIN_KEY", "admin2025");

    @Autowired private PresenceService presenceService;
    @Autowired private ScoreService scoreService;
    @Autowired private ErrorTrackingService errorTrackingService;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(
            @RequestHeader(value = "Authorization", defaultValue = "") String authHeader,
            HttpServletRequest request) {

        String key = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : "";

        if (!ADMIN_KEY.equals(key)) {
            log.warn("Accès admin refusé depuis {}", request.getRemoteAddr());
            return ResponseEntity.status(403).body(Map.of("erreur", "Accès refusé."));
        }

        List<Score> allScores = scoreService.getTousLesScores();

        // ── Statistiques par module ───────────────────────────────────────────
        List<String> moduleIds = List.of("general", "fakeoureel", "incoherence");
        Map<String, String> moduleLabels = Map.of(
                "general",     "Quiz intégral",
                "fakeoureel",  "Fake ou Réel",
                "incoherence", "Trouve l'incohérence"
        );

        List<Map<String, Object>> modules = moduleIds.stream().map(quizId -> {
            List<Score> moduleScores = allScores.stream()
                    .filter(s -> quizId.equals(s.getQuizId()))
                    .collect(Collectors.toList());

            // Score le plus récent par joueur
            Map<String, Score> latestByPlayer = moduleScores.stream()
                    .collect(Collectors.toMap(
                            Score::getPseudo,
                            s -> s,
                            (a, b) -> a.getDate().isAfter(b.getDate()) ? a : b
                    ));

            int totalPlayers = latestByPlayer.size();
            double avgPercent = latestByPlayer.values().stream()
                    .mapToInt(Score::getPourcentage)
                    .average()
                    .orElse(0);

            // Distribution par quartile
            Map<String, Long> distribution = new LinkedHashMap<>();
            distribution.put("0-25",   latestByPlayer.values().stream().filter(s -> s.getPourcentage() < 25).count());
            distribution.put("25-50",  latestByPlayer.values().stream().filter(s -> s.getPourcentage() >= 25 && s.getPourcentage() < 50).count());
            distribution.put("50-75",  latestByPlayer.values().stream().filter(s -> s.getPourcentage() >= 50 && s.getPourcentage() < 75).count());
            distribution.put("75-100", latestByPlayer.values().stream().filter(s -> s.getPourcentage() >= 75).count());

            Map<String, Object> module = new LinkedHashMap<>();
            module.put("id",           quizId);
            module.put("label",        moduleLabels.get(quizId));
            module.put("totalPlayers", totalPlayers);
            module.put("avgPercent",   (int) Math.round(avgPercent));
            module.put("distribution", distribution);
            return module;
        }).collect(Collectors.toList());

        // ── Progression : combien de modules chaque joueur a complétés ────────
        Map<String, Set<String>> playerModules = new HashMap<>();
        for (Score s : allScores) {
            playerModules.computeIfAbsent(s.getPseudo(), k -> new HashSet<>()).add(s.getQuizId());
        }
        Map<String, Long> progressionDist = new LinkedHashMap<>();
        progressionDist.put("1 module",   playerModules.values().stream().filter(m -> m.size() == 1).count());
        progressionDist.put("2 modules",  playerModules.values().stream().filter(m -> m.size() == 2).count());
        progressionDist.put("3 modules",  playerModules.values().stream().filter(m -> m.size() == 3).count());

        // ── Erreurs courantes par module ──────────────────────────────────────
        Map<String, Object> topErrors = new LinkedHashMap<>();
        for (String moduleId : moduleIds) {
            topErrors.put(moduleId, errorTrackingService.getTopErrors(moduleId, 6));
        }

        // ── Réponse ───────────────────────────────────────────────────────────
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("onlineNow",        presenceService.getOnlinePlayers().size());
        stats.put("onlinePlayers",    presenceService.getOnlinePlayers());
        stats.put("todayVisitors",    presenceService.getDailyVisitorCount());
        stats.put("totalUniquePlayers", playerModules.size());
        stats.put("modules",          modules);
        stats.put("progressionDist",  progressionDist);
        stats.put("topErrors",        topErrors);

        return ResponseEntity.ok(stats);
    }
}
