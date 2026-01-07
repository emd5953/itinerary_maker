package com.aspot.activity.service.external;

import com.aspot.activity.model.Activity;
import com.aspot.activity.model.ActivityCategory;
import com.aspot.activity.model.Location;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class GooglePlacesService {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${external.google.places.api-key:}")
    private String apiKey;
    
    private static final String PLACES_API_URL = "https://maps.googleapis.com/maps/api/place";
    
    /**
     * Search for activities in a destination using Google Places API
     */
    @Cacheable(value = "activities", key = "#destination + '_' + #category + '_' + #maxResults")
    public List<Activity> searchActivities(String destination, String category, int maxResults) {
        if (apiKey.isEmpty()) {
            log.warn("Google Places API key not configured, returning mock data");
            return getMockActivities(destination, category);
        }
        
        try {
            // First, get coordinates for the destination
            String geocodeUrl = String.format("%s/findplacefromtext/json?input=%s&inputtype=textquery&fields=geometry&key=%s",
                    PLACES_API_URL, destination, apiKey);
            
            String geocodeResponse = restTemplate.getForObject(geocodeUrl, String.class);
            JsonNode geocodeJson = objectMapper.readTree(geocodeResponse);
            
            if (geocodeJson.path("candidates").isEmpty()) {
                log.warn("Could not find coordinates for destination: {}", destination);
                return getMockActivities(destination, category);
            }
            
            JsonNode location = geocodeJson.path("candidates").get(0).path("geometry").path("location");
            double lat = location.path("lat").asDouble();
            double lng = location.path("lng").asDouble();
            
            // Search for places near the destination
            String searchUrl = String.format("%s/nearbysearch/json?location=%f,%f&radius=10000&type=%s&key=%s",
                    PLACES_API_URL, lat, lng, mapCategoryToGoogleType(category), apiKey);
            
            String searchResponse = restTemplate.getForObject(searchUrl, String.class);
            JsonNode searchJson = objectMapper.readTree(searchResponse);
            
            List<Activity> activities = new ArrayList<>();
            JsonNode results = searchJson.path("results");
            
            int count = 0;
            for (JsonNode result : results) {
                if (count >= maxResults) break;
                
                Activity activity = parseGooglePlaceToActivity(result, destination);
                if (activity != null && activity.getRating() != null && activity.getRating() >= 4.0) {
                    activities.add(activity);
                    count++;
                }
            }
            
            log.info("Found {} high-rated activities in {} for category {}", activities.size(), destination, category);
            return activities;
            
        } catch (Exception e) {
            log.error("Error fetching activities from Google Places API: {}", e.getMessage());
            return getMockActivities(destination, category);
        }
    }
    
    private Activity parseGooglePlaceToActivity(JsonNode place, String destination) {
        try {
            Activity activity = new Activity();
            activity.setId(UUID.randomUUID().toString());
            activity.setName(place.path("name").asText());
            activity.setDestination(destination);
            activity.setRating(place.path("rating").asDouble());
            activity.setReviewCount(place.path("user_ratings_total").asInt());
            activity.setPriceRange(mapPriceLevel(place.path("price_level").asInt()));
            
            // Set location
            JsonNode location = place.path("geometry").path("location");
            Location activityLocation = new Location();
            activityLocation.setLatitude(location.path("lat").asDouble());
            activityLocation.setLongitude(location.path("lng").asDouble());
            activityLocation.setAddress(place.path("vicinity").asText());
            activity.setLocation(activityLocation);
            
            // Set category based on types
            JsonNode types = place.path("types");
            activity.setCategory(mapGoogleTypesToCategory(types));
            
            // Set tags from types
            List<String> tags = new ArrayList<>();
            for (JsonNode type : types) {
                tags.add(type.asText());
            }
            activity.setTags(tags);
            
            // Mark as popular if high rating and many reviews
            activity.setIsPopular(activity.getRating() >= 4.5 && activity.getReviewCount() >= 100);
            
            return activity;
            
        } catch (Exception e) {
            log.error("Error parsing Google Place: {}", e.getMessage());
            return null;
        }
    }
    
    private String mapCategoryToGoogleType(String category) {
        return switch (category.toLowerCase()) {
            case "sights" -> "tourist_attraction";
            case "food" -> "restaurant";
            case "outdoor" -> "park";
            case "nightlife" -> "night_club";
            case "shopping" -> "shopping_mall";
            case "culture" -> "museum";
            default -> "point_of_interest";
        };
    }
    
    private ActivityCategory mapGoogleTypesToCategory(JsonNode types) {
        for (JsonNode type : types) {
            String typeStr = type.asText();
            switch (typeStr) {
                case "tourist_attraction", "museum", "art_gallery" -> {
                    return ActivityCategory.SIGHTS;
                }
                case "restaurant", "food", "cafe" -> {
                    return ActivityCategory.FOOD;
                }
                case "park", "zoo", "amusement_park" -> {
                    return ActivityCategory.OUTDOOR;
                }
                case "night_club", "bar" -> {
                    return ActivityCategory.NIGHTLIFE;
                }
                case "shopping_mall", "store" -> {
                    return ActivityCategory.SHOPPING;
                }
            }
        }
        return ActivityCategory.SIGHTS; // default
    }
    
    private String mapPriceLevel(int priceLevel) {
        return switch (priceLevel) {
            case 0 -> "Free";
            case 1 -> "$";
            case 2 -> "$";
            case 3 -> "$$";
            case 4 -> "$$";
            default -> "Unknown";
        };
    }
    
    /**
     * Mock data for when API key is not configured
     */
    private List<Activity> getMockActivities(String destination, String category) {
        List<Activity> mockActivities = new ArrayList<>();
        
        // Create some mock high-rated activities
        for (int i = 1; i <= 5; i++) {
            Activity activity = new Activity();
            activity.setId(UUID.randomUUID().toString());
            activity.setName(String.format("Top %s Spot #%d in %s", category, i, destination));
            activity.setDescription(String.format("Highly rated %s activity in %s", category, destination));
            activity.setDestination(destination);
            activity.setRating(4.0 + (i * 0.2)); // 4.2, 4.4, 4.6, 4.8, 5.0
            activity.setReviewCount(100 + (i * 50));
            activity.setPriceRange("$");
            activity.setCategory(ActivityCategory.valueOf(category.toUpperCase()));
            activity.setIsPopular(true);
            
            // Mock location
            Location location = new Location();
            location.setLatitude(40.7128 + (i * 0.01)); // Mock NYC area
            location.setLongitude(-74.0060 + (i * 0.01));
            location.setAddress(String.format("%d Main St, %s", i * 100, destination));
            activity.setLocation(location);
            
            mockActivities.add(activity);
        }
        
        log.info("Generated {} mock activities for {} in category {}", mockActivities.size(), destination, category);
        return mockActivities;
    }
}