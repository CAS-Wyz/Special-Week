package com.fakenews.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

@Service
public class PresenceService {

    private static final Pattern PSEUDO_PATTERN = Pattern.compile("^[a-zA-Z0-9_-]{2,20}$");
    private static final int TIMEOUT_SECONDS = 60;

    private final Map<String, LocalDateTime> presenceMap = new ConcurrentHashMap<>();

    public void ping(String pseudo) {
        if (pseudo == null || !PSEUDO_PATTERN.matcher(pseudo).matches()) {
            throw new IllegalArgumentException("Pseudo invalide. 2-20 caractères alphanumériques, _ ou - uniquement.");
        }
        cleanupInactive();
        presenceMap.put(pseudo, LocalDateTime.now());
    }

    public List<String> getOnlinePlayers() {
        cleanupInactive();
        return new ArrayList<>(presenceMap.keySet());
    }

    private void cleanupInactive() {
        LocalDateTime cutoff = LocalDateTime.now().minusSeconds(TIMEOUT_SECONDS);
        presenceMap.entrySet().removeIf(entry -> entry.getValue().isBefore(cutoff));
    }
}
