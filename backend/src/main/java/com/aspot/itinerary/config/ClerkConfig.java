package com.aspot.itinerary.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "spring.security.clerk")
@Data
public class ClerkConfig {
    
    private String publishableKey;
    private String secretKey;
    private String jwksUrl;
    
    public String getIssuer() {
        // Extract issuer from publishable key
        // pk_test_abc123 -> https://abc123.clerk.accounts.dev
        if (publishableKey != null && publishableKey.startsWith("pk_")) {
            String[] parts = publishableKey.split("_");
            if (parts.length >= 3) {
                return "https://" + parts[2] + ".clerk.accounts.dev";
            }
        }
        return "https://clerk.accounts.dev";
    }
}