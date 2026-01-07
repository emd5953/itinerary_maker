package com.aspot.itinerary.service.external;

import com.aspot.itinerary.model.activity.Activity;
import com.aspot.itinerary.model.enums.ActivityCategory;
import com.aspot.itinerary.model.valueobject.Location;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

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
    public List<Activity> searchActivities(String destination, String category, int maxResults) {
        log.info("Searching for {} activities in {} (max: {})", category, destination, maxResults);
        log.info("Google Places API key configured: {}", !apiKey.isEmpty());
        
        if (apiKey.isEmpty()) {
            log.warn("Google Places API key not configured, returning empty list");
            return new ArrayList<>();
        }
        
        try {
            // First, get coordinates for the destination
            String geocodeUrl = String.format("%s/findplacefromtext/json?input=%s&inputtype=textquery&fields=geometry&key=%s",
                    PLACES_API_URL, destination, apiKey);
            
            log.debug("Making geocode request to: {}", geocodeUrl);
            String geocodeResponse = restTemplate.getForObject(geocodeUrl, String.class);
            log.debug("Geocode response: {}", geocodeResponse);
            
            JsonNode geocodeJson = objectMapper.readTree(geocodeResponse);
            
            if (geocodeJson.path("candidates").isEmpty()) {
                log.warn("Could not find coordinates for destination: {}", destination);
                return new ArrayList<>();
            }
            
            JsonNode location = geocodeJson.path("candidates").get(0).path("geometry").path("location");
            double lat = location.path("lat").asDouble();
            double lng = location.path("lng").asDouble();
            
            log.info("Found coordinates for {}: lat={}, lng={}", destination, lat, lng);
            
            List<Activity> activities = new ArrayList<>();
            String[] searchTypes = getSearchTypesForCategory(category);
            
            // Try multiple search types for better coverage
            for (String searchType : searchTypes) {
                if (activities.size() >= maxResults) break;
                
                String searchUrl = String.format("%s/nearbysearch/json?location=%f,%f&radius=50000&type=%s&key=%s",
                        PLACES_API_URL, lat, lng, searchType, apiKey);
                
                log.debug("Making places search request for type '{}': {}", searchType, searchUrl);
                String searchResponse = restTemplate.getForObject(searchUrl, String.class);
                
                JsonNode searchJson = objectMapper.readTree(searchResponse);
                JsonNode results = searchJson.path("results");
                
                log.debug("Found {} results for search type '{}'", results.size(), searchType);
                
                for (JsonNode result : results) {
                    if (activities.size() >= maxResults) break;
                    
                    Activity activity = parseGooglePlaceToActivity(result, destination);
                    if (activity != null && activity.getRating() != null && activity.getRating() >= 3.5) {
                        // Check for duplicates
                        boolean isDuplicate = activities.stream()
                                .anyMatch(existing -> existing.getName().equalsIgnoreCase(activity.getName()));
                        
                        if (!isDuplicate) {
                            activities.add(activity);
                            log.debug("Added activity: {} (rating: {}, reviews: {})", 
                                    activity.getName(), activity.getRating(), activity.getReviewCount());
                        }
                    }
                }
            }
            
            log.info("Successfully found {} high-rated activities in {} for category {}", 
                    activities.size(), destination, category);
            return activities;
            
        } catch (Exception e) {
            log.error("Error fetching activities from Google Places API for {} in {}: {}", 
                    category, destination, e.getMessage());
            return new ArrayList<>();
        }
    }
    
    private Activity parseGooglePlaceToActivity(JsonNode place, String destination) {
        try {
            Activity activity = new Activity();
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
    
    /**
     * Get multiple search types for better coverage
     */
    private String[] getSearchTypesForCategory(String category) {
        return switch (category.toLowerCase()) {
            case "sights" -> new String[]{"tourist_attraction", "museum", "art_gallery", "church", "synagogue", "hindu_temple"};
            case "food" -> new String[]{"restaurant", "cafe", "bakery", "meal_takeaway"};
            case "outdoor" -> new String[]{"park", "zoo", "amusement_park", "aquarium"};
            case "nightlife" -> new String[]{"night_club", "bar"};
            case "shopping" -> new String[]{"shopping_mall", "store", "clothing_store"};
            case "culture" -> new String[]{"museum", "art_gallery", "library", "university"};
            default -> new String[]{"point_of_interest"};
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
            case 2 -> "$$";
            case 3 -> "$$$";
            case 4 -> "$$$$";
            default -> "Unknown";
        };
    }
}