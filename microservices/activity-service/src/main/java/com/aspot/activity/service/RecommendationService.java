package com.aspot.activity.service;

import com.aspot.activity.model.Activity;
import com.aspot.activity.model.UserPreferences;
import com.aspot.activity.model.BudgetLevel;
import com.aspot.activity.service.external.GooglePlacesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {
    
    private final GooglePlacesService googlePlacesService;
    
    /**
     * Generate personalized activity recommendations based on user preferences
     */
    @Cacheable(value = "recommendations", key = "#destination + '_' + #preferences.hashCode() + '_' + #maxResults")
    public List<Activity> generateRecommendations(String destination, UserPreferences preferences, int maxResults) {
        log.info("Generating recommendations for destination: {} with preferences: {}", destination, preferences);
        
        try {
            List<Activity> allActivities = new ArrayList<>();
            
            // Get activities for each user interest
            if (preferences.getInterests() != null && !preferences.getInterests().isEmpty()) {
                for (String interest : preferences.getInterests()) {
                    List<Activity> activities = googlePlacesService.searchActivities(destination, interest, 10);
                    allActivities.addAll(activities);
                }
            } else {
                // If no specific interests, get popular activities from all categories
                allActivities.addAll(getPopularActivitiesAllCategories(destination));
            }
            
            // Remove duplicates based on name and location
            allActivities = removeDuplicates(allActivities);
            
            // Score and rank activities based on user preferences
            List<ScoredActivity> scoredActivities = scoreActivities(allActivities, preferences);
            
            // Sort by score (highest first) and return top results
            return scoredActivities.stream()
                    .sorted((a, b) -> Double.compare(b.score, a.score))
                    .limit(maxResults)
                    .map(sa -> sa.activity)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error generating recommendations: {}", e.getMessage(), e);
            // Return mock activities as fallback
            return googlePlacesService.searchActivities(destination, "popular", maxResults);
        }
    }
    
    /**
     * Score activities based on user preferences
     */
    private List<ScoredActivity> scoreActivities(List<Activity> activities, UserPreferences preferences) {
        return activities.stream()
                .map(activity -> new ScoredActivity(activity, calculateScore(activity, preferences)))
                .collect(Collectors.toList());
    }
    
    /**
     * Calculate recommendation score for an activity based on user preferences
     */
    private double calculateScore(Activity activity, UserPreferences preferences) {
        double score = 0.0;
        
        // Base score from rating (0-5 scale, weight: 30%)
        if (activity.getRating() != null) {
            score += (activity.getRating() / 5.0) * 30.0;
        }
        
        // Review count bonus (more reviews = more reliable, weight: 10%)
        if (activity.getReviewCount() != null) {
            double reviewScore = Math.min(activity.getReviewCount() / 100.0, 1.0); // Cap at 100 reviews
            score += reviewScore * 10.0;
        }
        
        // Interest matching (weight: 40%)
        double interestScore = calculateInterestMatch(activity, preferences.getInterests());
        score += interestScore * 40.0;
        
        // Budget compatibility (weight: 15%)
        double budgetScore = calculateBudgetMatch(activity, preferences.getBudgetLevelEnum());
        score += budgetScore * 15.0;
        
        // Popularity bonus (weight: 5%)
        if (activity.getIsPopular() != null && activity.getIsPopular()) {
            score += 5.0;
        }
        
        log.debug("Activity '{}' scored: {} (rating: {}, reviews: {}, interests: {}, budget: {})", 
                activity.getName(), score, activity.getRating(), activity.getReviewCount(), interestScore, budgetScore);
        
        return score;
    }
    
    /**
     * Calculate how well an activity matches user interests
     */
    private double calculateInterestMatch(Activity activity, List<String> userInterests) {
        if (userInterests == null || userInterests.isEmpty()) {
            return 0.5; // Neutral score if no preferences
        }
        
        double matchScore = 0.0;
        
        // Check category match
        if (activity.getCategory() != null) {
            String categoryName = activity.getCategory().name().toLowerCase();
            if (userInterests.contains(categoryName)) {
                matchScore += 0.7; // Strong match for category
            }
        }
        
        // Check tag matches
        if (activity.getTags() != null) {
            for (String tag : activity.getTags()) {
                for (String interest : userInterests) {
                    if (tag.toLowerCase().contains(interest.toLowerCase()) || 
                        interest.toLowerCase().contains(tag.toLowerCase())) {
                        matchScore += 0.1; // Bonus for tag matches
                    }
                }
            }
        }
        
        return Math.min(matchScore, 1.0); // Cap at 1.0
    }
    
    /**
     * Calculate budget compatibility score
     */
    private double calculateBudgetMatch(Activity activity, BudgetLevel budgetLevel) {
        if (activity.getPriceRange() == null || budgetLevel == null) {
            return 0.5; // Neutral if no price info
        }
        
        String priceRange = activity.getPriceRange();
        
        if (budgetLevel == BudgetLevel.BUDGET) {
            return switch (priceRange) {
                case "Free" -> 1.0;
                case "$" -> 0.6;
                case "$$" -> 0.3;
                default -> 0.2;
            };
        } else if (budgetLevel == BudgetLevel.MID_RANGE) {
            return switch (priceRange) {
                case "Free" -> 0.8;
                case "$" -> 1.0;
                case "$$" -> 0.9;
                case "$$$" -> 0.7;
                default -> 0.5;
            };
        } else if (budgetLevel == BudgetLevel.LUXURY) {
            return switch (priceRange) {
                case "Free" -> 0.4;
                case "$" -> 0.6;
                case "$$" -> 0.8;
                case "$$$" -> 1.0;
                case "$$$$" -> 1.0;
                default -> 0.5;
            };
        }
        
        return 0.5; // Default fallback
    }
    
    /**
     * Get popular activities from all categories when user has no specific interests
     */
    private List<Activity> getPopularActivitiesAllCategories(String destination) {
        List<Activity> popularActivities = new ArrayList<>();
        
        String[] categories = {"sights", "food", "outdoor", "culture"};
        
        for (String category : categories) {
            try {
                List<Activity> categoryActivities = googlePlacesService.searchActivities(destination, category, 5);
                popularActivities.addAll(categoryActivities);
            } catch (Exception e) {
                log.warn("Failed to get activities for category {}: {}", category, e.getMessage());
            }
        }
        
        return popularActivities;
    }
    
    /**
     * Remove duplicate activities based on name similarity and location proximity
     */
    private List<Activity> removeDuplicates(List<Activity> activities) {
        List<Activity> uniqueActivities = new ArrayList<>();
        
        for (Activity activity : activities) {
            boolean isDuplicate = false;
            
            for (Activity existing : uniqueActivities) {
                if (isSimilarActivity(activity, existing)) {
                    isDuplicate = true;
                    // Keep the one with higher rating
                    if (activity.getRating() != null && existing.getRating() != null && 
                        activity.getRating() > existing.getRating()) {
                        uniqueActivities.remove(existing);
                        uniqueActivities.add(activity);
                    }
                    break;
                }
            }
            
            if (!isDuplicate) {
                uniqueActivities.add(activity);
            }
        }
        
        log.info("Removed {} duplicates, {} unique activities remaining", 
                activities.size() - uniqueActivities.size(), uniqueActivities.size());
        
        return uniqueActivities;
    }
    
    /**
     * Check if two activities are similar (likely duplicates)
     */
    private boolean isSimilarActivity(Activity a1, Activity a2) {
        // Check name similarity
        String name1 = a1.getName().toLowerCase().trim();
        String name2 = a2.getName().toLowerCase().trim();
        
        if (name1.equals(name2)) {
            return true;
        }
        
        // Check if names are very similar (simple approach)
        if (name1.length() > 5 && name2.length() > 5) {
            String shorter = name1.length() < name2.length() ? name1 : name2;
            String longer = name1.length() >= name2.length() ? name1 : name2;
            
            if (longer.contains(shorter)) {
                return true;
            }
        }
        
        // Check location proximity (if both have coordinates)
        if (a1.getLocation() != null && a2.getLocation() != null &&
            a1.getLocation().getLatitude() != null && a1.getLocation().getLongitude() != null &&
            a2.getLocation().getLatitude() != null && a2.getLocation().getLongitude() != null) {
            
            double distance = calculateDistance(
                a1.getLocation().getLatitude(), a1.getLocation().getLongitude(),
                a2.getLocation().getLatitude(), a2.getLocation().getLongitude()
            );
            
            // If within 100 meters and similar names, likely duplicate
            if (distance < 0.1 && (name1.contains(name2.split(" ")[0]) || name2.contains(name1.split(" ")[0]))) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Calculate distance between two coordinates in kilometers
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }
    
    /**
     * Helper class to hold activity with its calculated score
     */
    private static class ScoredActivity {
        final Activity activity;
        final double score;
        
        ScoredActivity(Activity activity, double score) {
            this.activity = activity;
            this.score = score;
        }
    }
}