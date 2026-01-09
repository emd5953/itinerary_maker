package com.aspot.activity.controller;

import com.aspot.activity.model.Activity;
import com.aspot.activity.model.UserPreferences;
import com.aspot.activity.service.ActivityService;
import com.aspot.activity.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
@Slf4j
public class ActivityController {
    
    private final ActivityService activityService;
    private final RecommendationService recommendationService;
    
    /**
     * Get activity by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Activity> getActivity(@PathVariable String id) {
        log.info("Getting activity with id: {}", id);
        
        Optional<Activity> activity = activityService.getActivityById(id);
        return activity.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Search activities by destination and optional category
     */
    @GetMapping("/search")
    public ResponseEntity<List<Activity>> searchActivities(
            @RequestParam String destination,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "20") int limit) {
        
        log.info("Searching activities for destination: {}, category: {}, limit: {}", destination, category, limit);
        
        try {
            List<Activity> activities = activityService.searchActivities(destination, category, limit);
            log.info("Successfully found {} activities", activities.size());
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            log.error("Error searching activities: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(List.of());
        }
    }
    
    /**
     * Get activities near a location
     */
    @GetMapping("/nearby")
    public ResponseEntity<List<Activity>> getActivitiesNearby(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10") double radius,
            @RequestParam(defaultValue = "20") int limit) {
        
        log.info("Getting activities near lat: {}, lng: {}, radius: {}km, limit: {}", lat, lng, radius, limit);
        
        List<Activity> activities = activityService.getActivitiesNearby(lat, lng, radius, limit);
        return ResponseEntity.ok(activities);
    }
    
    /**
     * Search activities by text query
     */
    @GetMapping("/query")
    public ResponseEntity<Page<Activity>> searchActivitiesByQuery(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Searching activities with query: {}, page: {}, size: {}", q, page, size);
        
        Page<Activity> activities = activityService.searchActivitiesByQuery(q, page, size);
        return ResponseEntity.ok(activities);
    }
    
    /**
     * Get popular activities for a destination
     */
    @GetMapping("/popular")
    public ResponseEntity<List<Activity>> getPopularActivities(
            @RequestParam String destination,
            @RequestParam(defaultValue = "10") int limit) {
        
        log.info("Getting popular activities for destination: {}, limit: {}", destination, limit);
        
        try {
            List<Activity> activities = activityService.getPopularActivities(destination, limit);
            log.info("Successfully found {} popular activities", activities.size());
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            log.error("Error getting popular activities: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(List.of());
        }
    }
    
    /**
     * Get personalized recommendations
     */
    @PostMapping("/recommendations")
    public ResponseEntity<List<Activity>> getRecommendations(
            @RequestParam String destination,
            @RequestParam(defaultValue = "10") int limit,
            @RequestBody UserPreferences preferences) {
        
        log.info("Getting recommendations for destination: {}, limit: {}, preferences: {}", destination, limit, preferences);
        
        try {
            List<Activity> recommendations = recommendationService.generateRecommendations(destination, preferences, limit);
            log.info("Successfully generated {} recommendations", recommendations.size());
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            log.error("Error generating recommendations: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(List.of());
        }
    }
    
    /**
     * Create or update an activity
     */
    @PostMapping
    public ResponseEntity<Activity> createActivity(@RequestBody Activity activity) {
        log.info("Creating activity: {}", activity.getName());
        
        Activity savedActivity = activityService.saveActivity(activity);
        return ResponseEntity.ok(savedActivity);
    }
    
    /**
     * Update an activity
     */
    @PutMapping("/{id}")
    public ResponseEntity<Activity> updateActivity(@PathVariable String id, @RequestBody Activity activity) {
        log.info("Updating activity with id: {}", id);
        
        activity.setId(id);
        Activity updatedActivity = activityService.saveActivity(activity);
        return ResponseEntity.ok(updatedActivity);
    }
    
    /**
     * Delete an activity
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivity(@PathVariable String id) {
        log.info("Deleting activity with id: {}", id);
        
        activityService.deleteActivity(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Activity Service is running");
    }
}