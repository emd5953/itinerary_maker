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
        // For Clerk, the issuer should match the JWKS URL domain
        // Extract from JWKS URL: https://safe-heron-62.clerk.accounts.dev/.well-known/jwks.json
        if (jwksUrl != null && jwksUrl.contains(".clerk.accounts.dev")) {
            String domain = jwksUrl.substring(8); // Remove "https://"
            int endIndex = domain.indexOf("/.well-known");
            if (endIndex > 0) {
                return "https://" + domain.substring(0, endIndex);
            }
        }
        
        // Fallback: try to decode from publishable key
        if (publishableKey != null && publishableKey.startsWith("pk_test_")) {
            try {
                String encoded = publishableKey.substring(8); // Remove "pk_test_"
                byte[] decoded = java.util.Base64.getDecoder().decode(encoded);
                String decodedStr = new String(decoded);
                // Remove trailing $ if present
                if (decodedStr.endsWith("$")) {
                    decodedStr = decodedStr.substring(0, decodedStr.length() - 1);
                }
                return "https://" + decodedStr;
            } catch (Exception e) {
                // If decoding fails, fall back to default
            }
        }
        
        return "https://clerk.accounts.dev";
    }
}