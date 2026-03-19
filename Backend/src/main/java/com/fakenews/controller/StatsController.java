package com.fakenews.controller;

import com.fakenews.service.ErrorTrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

/**
 * Endpoint public pour enregistrer les erreurs des joueurs.
 * POST /api/stats/error
 */
@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private static final Set<String> VALID_MODULES = Set.of("general", "fakeoureel", "incoherence");

    @Autowired
    private ErrorTrackingService errorTrackingService;

    @PostMapping("/error")
    public ResponseEntity<?> recordError(@RequestBody Map<String, String> body) {
        String module = body.get("module");
        String label  = body.get("label");

        if (module == null || !VALID_MODULES.contains(module) || label == null || label.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        // Truncate label to avoid abuse
        if (label.length() > 100) label = label.substring(0, 100);

        errorTrackingService.recordError(module, label);
        return ResponseEntity.ok().build();
    }
}
