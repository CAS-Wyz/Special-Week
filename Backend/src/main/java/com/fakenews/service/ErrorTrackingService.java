package com.fakenews.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Suivi en mémoire des erreurs courantes par module.
 * Clé : "module:label" → nombre d'occurrences
 */
@Service
public class ErrorTrackingService {

    private final Map<String, Integer> errorCounts = new ConcurrentHashMap<>();

    public void recordError(String module, String label) {
        if (module == null || label == null || module.isBlank() || label.isBlank()) return;
        String key = module + ":" + label;
        errorCounts.merge(key, 1, Integer::sum);
    }

    public List<Map<String, Object>> getTopErrors(String module, int limit) {
        String prefix = module + ":";
        return errorCounts.entrySet().stream()
                .filter(e -> e.getKey().startsWith(prefix))
                .sorted((a, b) -> b.getValue() - a.getValue())
                .limit(limit)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("label", e.getKey().substring(prefix.length()));
                    m.put("count", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());
    }
}
