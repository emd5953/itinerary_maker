package com.aspot.itinerary.service.auth;

import com.aspot.itinerary.config.ClerkConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import javax.crypto.SecretKey;
import java.math.BigInteger;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClerkAuthService {
    
    private final ClerkConfig clerkConfig;
    private final WebClient webClient = WebClient.builder().build();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // Cache for JWKS keys
    private final Map<String, PublicKey> keyCache = new ConcurrentHashMap<>();
    private volatile long lastKeyFetch = 0;
    private static final long KEY_CACHE_DURATION = 3600000; // 1 hour
    
    /**
     * Validates a Clerk JWT token and returns the user ID
     */
    public String validateTokenAndGetUserId(String token) {
        try {
            // Remove "Bearer " prefix if present
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            // Parse token header to get key ID
            String[] tokenParts = token.split("\\.");
            if (tokenParts.length != 3) {
                throw new IllegalArgumentException("Invalid JWT format");
            }
            
            String headerJson = new String(Base64.getUrlDecoder().decode(tokenParts[0]));
            JsonNode header = objectMapper.readTree(headerJson);
            String keyId = header.get("kid").asText();
            
            // Get public key for verification
            PublicKey publicKey = getPublicKey(keyId);
            
            // Verify and parse token
            Claims claims = Jwts.parser()
                    .setSigningKey(publicKey)
                    .requireIssuer(clerkConfig.getIssuer())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            // Extract user ID from claims
            String userId = claims.getSubject();
            log.debug("Successfully validated token for user: {}", userId);
            
            return userId;
            
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            throw new SecurityException("Invalid token", e);
        }
    }
    
    /**
     * Gets user information from Clerk API
     */
    public ClerkUser getUserInfo(String userId) {
        try {
            String response = webClient.get()
                    .uri("https://api.clerk.com/v1/users/" + userId)
                    .header("Authorization", "Bearer " + clerkConfig.getSecretKey())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            
            JsonNode userNode = objectMapper.readTree(response);
            
            return ClerkUser.builder()
                    .id(userNode.get("id").asText())
                    .email(getEmailFromNode(userNode))
                    .firstName(userNode.path("first_name").asText())
                    .lastName(userNode.path("last_name").asText())
                    .imageUrl(userNode.path("image_url").asText())
                    .build();
                    
        } catch (Exception e) {
            log.error("Failed to fetch user info for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to fetch user info", e);
        }
    }
    
    private String getEmailFromNode(JsonNode userNode) {
        JsonNode emailAddresses = userNode.get("email_addresses");
        if (emailAddresses != null && emailAddresses.isArray() && emailAddresses.size() > 0) {
            JsonNode primaryEmail = emailAddresses.get(0);
            return primaryEmail.get("email_address").asText();
        }
        return null;
    }
    
    private PublicKey getPublicKey(String keyId) {
        // Check cache first
        if (keyCache.containsKey(keyId) && 
            System.currentTimeMillis() - lastKeyFetch < KEY_CACHE_DURATION) {
            return keyCache.get(keyId);
        }
        
        try {
            // Fetch JWKS from Clerk
            String jwksResponse = webClient.get()
                    .uri(clerkConfig.getJwksUrl())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            
            JsonNode jwks = objectMapper.readTree(jwksResponse);
            JsonNode keys = jwks.get("keys");
            
            for (JsonNode key : keys) {
                if (keyId.equals(key.get("kid").asText())) {
                    PublicKey publicKey = buildRSAPublicKey(key);
                    keyCache.put(keyId, publicKey);
                    lastKeyFetch = System.currentTimeMillis();
                    return publicKey;
                }
            }
            
            throw new SecurityException("Key not found: " + keyId);
            
        } catch (Exception e) {
            log.error("Failed to fetch JWKS: {}", e.getMessage());
            throw new SecurityException("Failed to validate token", e);
        }
    }
    
    private PublicKey buildRSAPublicKey(JsonNode key) throws Exception {
        byte[] nBytes = Base64.getUrlDecoder().decode(key.get("n").asText());
        byte[] eBytes = Base64.getUrlDecoder().decode(key.get("e").asText());
        
        BigInteger modulus = new BigInteger(1, nBytes);
        BigInteger exponent = new BigInteger(1, eBytes);
        
        RSAPublicKeySpec spec = new RSAPublicKeySpec(modulus, exponent);
        KeyFactory factory = KeyFactory.getInstance("RSA");
        
        return factory.generatePublic(spec);
    }
}