package com.aspot.itinerary.service.external;

import com.aspot.itinerary.model.activity.Activity;
import com.aspot.itinerary.model.enums.ActivityCategory;
import com.aspot.itinerary.model.valueobject.Location;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class YelpService {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${external.yelp.api.key:}")
    private String apiKey;
    
    private static final String YELP_API_URL = "https://api.yelp.com/v3/businesses/search";
    
    /**
     * Search for businesses using Yelp API
     */
    public List<Activity> searchBusinesses(String destination, String category, int maxResults) {
        if (apiKey.isEmpty()) {
            log.warn("Yelp API key not configured, returning mock data");
            return getMockYelpActivities(destination, category);
        }
        
        try {
            String url = String.format("%s?location=%s&categories=%s&sort_by=rating&limit=%d",
                    YELP_API_URL, destination, mapCategoryToYelpCategory(category), Math.min(maxResults, 50));
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            JsonNode responseJson = objectMapper.readTree(response.getBody());
            
            List<Activity> activities = new ArrayList<>();
            JsonNode businesses = responseJson.path("businesses");
            
            for (JsonNode business : businesses) {
                Activity activity = parseYelpBusinessToActivity(business, destination);
                if (activity != null && activity.getRating() != null && activity.getRating() >= 4.0) {
                    activities.add(activity);
                }
            }
            
            log.info("Found {} high-rated businesses from Yelp in {} for category {}", activities.size(), destination, category);
            return activities;
            
        } catch (Exception e) {
            log.error("Error fetching businesses from Yelp API: {}", e.getMessage());
            return getMockYelpActivities(destination, category);
        }
    }
    
    private Activity parseYelpBusinessToActivity(JsonNode business, String destination) {
        try {
            Activity activity = new Activity();
            activity.setName(business.path("name").asText());
            activity.setDestination(destination);
            activity.setRating(business.path("rating").asDouble());
            activity.setReviewCount(business.path("review_count").asInt());
            activity.setPriceRange(business.path("price").asText("$$"));
            activity.setWebsiteUrl(business.path("url").asText());
            
            // Set location
            JsonNode coordinates = business.path("coordinates");
            JsonNode locationNode = business.path("location");
            Location activityLocation = new Location();
            activityLocation.setLatitude(coordinates.path("latitude").asDouble());
            activityLocation.setLongitude(coordinates.path("longitude").asDouble());
            
            // Build address from Yelp location data
            StringBuilder address = new StringBuilder();
            JsonNode displayAddress = locationNode.path("display_address");
            for (JsonNode addressLine : displayAddress) {
                if (address.length() > 0) address.append(", ");
                address.append(addressLine.asText());
            }
            activityLocation.setAddress(address.toString());
            activity.setLocation(activityLocation);
            
            // Set category based on Yelp categories
            JsonNode categories = business.path("categories");
            activity.setCategory(mapYelpCategoriesToActivityCategory(categories));
            
            // Set tags from categories
            List<String> tags = new ArrayList<>();
            for (JsonNode category : categories) {
                tags.add(category.path("title").asText());
            }
            activity.setTags(tags);
            
            // Set images
            List<String> imageUrls = new ArrayList<>();
            String imageUrl = business.path("image_url").asText();
            if (!imageUrl.isEmpty()) {
                imageUrls.add(imageUrl);
            }
            activity.setImageUrls(imageUrls);
            
            // Mark as popular if high rating and many reviews
            activity.setIsPopular(activity.getRating() >= 4.5 && activity.getReviewCount() >= 50);
            
            return activity;
            
        } catch (Exception e) {
            log.error("Error parsing Yelp business: {}", e.getMessage());
            return null;
        }
    }
    
    private String mapCategoryToYelpCategory(String category) {
        return switch (category.toLowerCase()) {
            case "food" -> "restaurants";
            case "nightlife" -> "nightlife";
            case "shopping" -> "shopping";
            case "sights" -> "tours";
            case "outdoor" -> "active";
            case "culture" -> "arts";
            default -> "restaurants";
        };
    }
    
    private ActivityCategory mapYelpCategoriesToActivityCategory(JsonNode categories) {
        for (JsonNode category : categories) {
            String alias = category.path("alias").asText();
            switch (alias) {
                case "restaurants", "food", "cafes", "bars" -> {
                    return ActivityCategory.FOOD;
                }
                case "nightlife", "cocktailbars", "danceclubs" -> {
                    return ActivityCategory.NIGHTLIFE;
                }
                case "shopping", "shoppingcenters" -> {
                    return ActivityCategory.SHOPPING;
                }
                case "tours", "museums", "galleries" -> {
                    return ActivityCategory.SIGHTS;
                }
                case "active", "parks", "hiking" -> {
                    return ActivityCategory.OUTDOOR;
                }
            }
        }
        return ActivityCategory.FOOD; // default for Yelp
    }
    
    /**
     * Mock data for when API key is not configured
     */
    private List<Activity> getMockYelpActivities(String destination, String category) {
        List<Activity> mockActivities = new ArrayList<>();
        
        String[] businessNames = {
            "The Best Local Spot", "Hidden Gem Cafe", "Top Rated Restaurant", 
            "Popular Local Hangout", "Must-Visit Place"
        };
        
        for (int i = 0; i < businessNames.length; i++) {
            Activity activity = new Activity();
            activity.setName(businessNames[i] + " - " + destination);
            activity.setDescription(String.format("Top-rated %s business in %s according to Yelp", category, destination));
            activity.setDestination(destination);
            activity.setRating(4.1 + (i * 0.15)); // 4.1, 4.25, 4.4, 4.55, 4.7
            activity.setReviewCount(75 + (i * 25));
            activity.setPriceRange("$$");
            activity.setCategory(ActivityCategory.valueOf(category.toUpperCase()));
            activity.setIsPopular(true);
            
            // Mock location
            Location location = new Location();
            location.setLatitude(40.7128 + (i * 0.005)); // Mock NYC area
            location.setLongitude(-74.0060 + (i * 0.005));
            location.setAddress(String.format("%d Yelp St, %s", (i + 1) * 50, destination));
            activity.setLocation(location);
            
            mockActivities.add(activity);
        }
        
        log.info("Generated {} mock Yelp activities for {} in category {}", mockActivities.size(), destination, category);
        return mockActivities;
    }
}