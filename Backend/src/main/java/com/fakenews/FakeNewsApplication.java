package com.fakenews;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Point d'entrée de l'application.
 * Cette classe démarre le serveur Spring Boot.
 * 
 * Pour lancer : mvn spring-boot:run
 * Ou clic droit > Run dans VS Code
 */
@SpringBootApplication
public class FakeNewsApplication {

    public static void main(String[] args) {
        SpringApplication.run(FakeNewsApplication.class, args);
        System.out.println("✅ Serveur démarré sur http://localhost:8080");
    }
}
