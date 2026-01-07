package com.aspot.itinerary.service.external;

import com.aspot.itinerary.dto.ActivityDto;
import com.aspot.itinerary.dto.UserPreferencesDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityServiceClient {
    
    private final RestTemplate restTemplate;
    
    @Value("${external.services.activity-service}")
    private String activityServiceUrl;
    
    /**
     * Get activity by ID from Activity Service
     */
    public ActivityDto getActivity(String activityId) {
        try {
            String url = activityServiceUrl + "/api/activities/" + activityId;
            ResponseEntity<ActivityDto> response = restTemplate.getForEntity(url, ActivityDto.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("Error fetching activity {} from Activity Service: {}", activityId, e.getMessage());
            return null;
        }
    }
    
    /**
     * Search activities by destination and category
     */
    public List<ActivityDto> searchActivities(String destination, String category, int limit) {
        try {
            String url = String.format("%s/api/activities/search?destination=%s&limit=%d", 
                    activityServiceUrl, destination, limit);
            
            if (category != null && !category.isEmpty()) {
                url += "&category=" + category;
            }
            
            ResponseEntity<List<ActivityDto>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<ActivityDto>>() {}
            );
            
            return response.getBody() != null ? response.getBody() : Collections.emptyList();
        } catch (Exception e) {
            log.error("Error searching activities from Activity Service: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
    
    /**
     * Get personalized recommendations
     */
    public List<ActivityDto> getRecommendations(String destination, UserPreferencesDto preferences, int limit) {
        try {
            String url = String.format("%s/api/activities/recommendations?destination=%s&limit=%d", 
                    activityServiceUrl, destination, limit);
            
            HttpEntity<UserPreferencesDto> request = new HttpEntity<>(preferences);
            
            ResponseEntity<List<ActivityDto>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    new ParameterizedTypeReference<List<ActivityDto>>() {}
            );
            
            return response.getBody() != null ? response.getBody() : Collections.emptyList();
        } catch (Exception e) {
            log.error("Error getting recommendations from Activity Service: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
    
    /**
     * Get popular activities for a destination
     */
    public List<ActivityDto> getPopularActivities(String destination, int limit) {
        try {
            String url = String.format("%s/api/activities/popular?destination=%s&limit=%d", 
                    activityServiceUrl, destination, limit);
            
            ResponseEntity<List<ActivityDto>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<ActivityDto>>() {}
            );
            
            return response.getBody() != null ? response.getBody() : Collections.emptyList();
        } catch (Exception e) {
            log.error("Error getting popular activities from Activity Service: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}