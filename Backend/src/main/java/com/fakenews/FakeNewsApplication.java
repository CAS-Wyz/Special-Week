package com.fakenews;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Point d'entrée de l'application.
 * Cette classe démarre le serveur Spring Boot.
 *
 * Pour lancer : mvn spring-boot:run
 * Ou clic droit > Run dans VS Code
 */
@SpringBootApplication
@EnableScheduling
public class FakeNewsApplication {

    public static void main(String[] args) {
        SpringApplication.run(FakeNewsApplication.class, args);
        System.out.println("✅ Serveur démarré sur http://localhost:8080");

        // Avertissement si ADMIN_KEY n'est pas configuré
        if (System.getenv("ADMIN_KEY") == null) {
            System.out.println("⚠️  AVERTISSEMENT : ADMIN_KEY non défini — clé par défaut utilisée. Configurez ADMIN_KEY en production !");
        }
    }
}
