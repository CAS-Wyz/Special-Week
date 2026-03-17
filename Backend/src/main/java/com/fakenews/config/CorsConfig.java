package com.fakenews.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * Configuration CORS (Cross-Origin Resource Sharing)
 * 
 * Permet à ton frontend (HTML/JS) d'appeler l'API backend
 * même s'ils ne sont pas sur le même port/domaine.
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Autorise ces origines (ajoute ton URL Azure plus tard)
        config.addAllowedOrigin("http://localhost:5500");
        config.addAllowedOrigin("http://127.0.0.1:5500");
        config.addAllowedOrigin("http://localhost:3000");
        // config.addAllowedOrigin("https://ton-site.azurewebsites.net");
        
        // Autorise toutes les méthodes HTTP
        config.addAllowedMethod("*");
        
        // Autorise tous les headers
        config.addAllowedHeader("*");
        
        // Autorise les cookies (si besoin plus tard)
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
