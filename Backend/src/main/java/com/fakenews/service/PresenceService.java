package com.fakenews.service;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

@Service
public class PresenceService {

    // Bloque les caractères de contrôle et les caractères HTML dangereux (<>"&)
    // mais autorise les espaces, accents, emoji et autres caractères spéciaux
    private static final Pattern PSEUDO_PATTERN = Pattern.compile("^[^\\x00-\\x1f\\x7f<>\"&]{2,20}$");
    private static final int TIMEOUT_SECONDS = 60;

    private final Map<String, LocalDateTime> presenceMap = new ConcurrentHashMap<>();

    // Suivi des visiteurs uniques du jour
    private final Set<String> dailyVisitors = ConcurrentHashMap.newKeySet();
    private LocalDate currentDay = LocalDate.now();

    public void ping(String pseudo) {
        if (pseudo == null || !PSEUDO_PATTERN.matcher(pseudo).matches()) {
            throw new IllegalArgumentException("Pseudo invalide. 2-20 caractères alphanumériques, _ ou - uniquement.");
        }
        checkDayRollover();
        dailyVisitors.add(pseudo);
        cleanupInactive();
        presenceMap.put(pseudo, LocalDateTime.now());
    }

    public int getDailyVisitorCount() {
        checkDayRollover();
        return dailyVisitors.size();
    }

    private synchronized void checkDayRollover() {
        LocalDate today = LocalDate.now();
        if (!today.equals(currentDay)) {
            dailyVisitors.clear();
            currentDay = today;
        }
    }

    public List<String> getOnlinePlayers() {
        cleanupInactive();
        return new ArrayList<>(presenceMap.keySet());
    }

    public void removePlayer(String pseudo) {
        presenceMap.remove(pseudo);
    }

    private void cleanupInactive() {
        LocalDateTime cutoff = LocalDateTime.now().minusSeconds(TIMEOUT_SECONDS);
        presenceMap.entrySet().removeIf(entry -> entry.getValue().isBefore(cutoff));
    }
}
