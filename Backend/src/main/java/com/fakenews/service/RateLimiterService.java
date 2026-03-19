package com.fakenews.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiter simple en mémoire.
 * Limite le nombre de requêtes par IP sur une fenêtre glissante.
 */
@Service
public class RateLimiterService {

    // Clé : "endpoint:ip" → timestamps des requêtes récentes
    private final Map<String, Deque<Long>> requestMap = new ConcurrentHashMap<>();

    /**
     * Vérifie si la requête est autorisée.
     *
     * @param key         identifiant unique (ex: "ping:192.168.1.1")
     * @param maxRequests nombre max de requêtes autorisées
     * @param windowMs    fenêtre de temps en millisecondes
     * @return true si autorisé, false si limite atteinte
     */
    public boolean isAllowed(String key, int maxRequests, long windowMs) {
        long now = Instant.now().toEpochMilli();
        long cutoff = now - windowMs;

        requestMap.computeIfAbsent(key, k -> new ArrayDeque<>());
        Deque<Long> timestamps = requestMap.get(key);

        synchronized (timestamps) {
            // Supprimer les entrées hors de la fenêtre
            while (!timestamps.isEmpty() && timestamps.peekFirst() < cutoff) {
                timestamps.pollFirst();
            }

            if (timestamps.size() >= maxRequests) {
                return false;
            }

            timestamps.addLast(now);
            return true;
        }
    }
}
