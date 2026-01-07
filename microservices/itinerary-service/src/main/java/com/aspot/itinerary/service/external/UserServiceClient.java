package com.aspot.itinerary.service.external;

import com.aspot.itinerary.dto.UserPreferencesDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceClient {
    
    private final RestTemplate restTemplate;
    
    @Value("${external.services.user-service}")
    private String userServiceUrl;
    
    /**
     * Get user preferences from User Service
     */
    public UserPreferencesDto getUserPreferences(UUID userId) {
        try {
            String url = userServiceUrl + "/api/users/" + userId + "/preferences";
            ResponseEntity<UserPreferencesDto> response = restTemplate.getForEntity(url, UserPreferencesDto.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("Error fetching user preferences for user {} from User Service: {}", userId, e.getMessage());
            return null;
        }
    }
    
    /**
     * Validate if user exists
     */
    public boolean userExists(UUID userId) {
        try {
            String url = userServiceUrl + "/api/users/" + userId;
            ResponseEntity<Object> response = restTemplate.getForEntity(url, Object.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.error("Error validating user {} from User Service: {}", userId, e.getMessage());
            return false;
        }
    }
}