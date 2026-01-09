package com.aspot.activity.service;

import com.aspot.activity.model.Activity;
import com.aspot.activity.model.ActivityCategory;
import com.aspot.activity.repository.ActivityRepository;
import com.aspot.activity.service.external.GooglePlacesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityService {
    
    private final ActivityRepository activityRepository;
    private final GooglePlacesService googlePlacesService;
    
    /**
     * Get activity by ID
     */
    public Optional<Activity> getActivityById(String id) {
        return activityRepository.findById(id);
    }
    
    /**
     * Search activities by destination and optional category
     */
    @Cacheable(value = "activity-search", key = "#destination + '_' + #category")
    public List<Activity> searchActivities(String destination, String category, int limit) {
        log.info("Searching activities for destination: {}, category: {}", destination, category);
        
        try {
            // First check if we have cached activities in Elasticsearch
            List<Activity> cachedActivities;
            if (category != null && !category.isEmpty()) {
                try {
                    ActivityCategory activityCategory = ActivityCategory.valueOf(category.toUpperCase());
                    cachedActivities = activityRepository.findByDestinationIgnoreCaseAndCategory(destination, activityCategory);
                } catch (IllegalArgumentException e) {
                    cachedActivities = activityRepository.findByDestinationIgnoreCase(destination);
                }
            } else {
                cachedActivities = activityRepository.findByDestinationIgnoreCase(destination);
            }
            
            // If we have enough cached activities, return them
            if (cachedActivities.size() >= limit) {
                log.info("Found {} cached activities for {}", cachedActivities.size(), destination);
                return cachedActivities.subList(0, Math.min(limit, cachedActivities.size()));
            }
        } catch (Exception e) {
            log.warn("Elasticsearch query failed, falling back to external APIs: {}", e.getMessage());
        }
        
        // Otherwise, fetch from external APIs and cache them
        List<Activity> freshActivities = googlePlacesService.searchActivities(destination, category, limit);
        
        // Try to save to Elasticsearch for future queries (but don't fail if it doesn't work)
        if (!freshActivities.isEmpty()) {
            try {
                activityRepository.saveAll(freshActivities);
                log.info("Cached {} new activities for {}", freshActivities.size(), destination);
            } catch (Exception e) {
                log.warn("Failed to cache activities in Elasticsearch: {}", e.getMessage());
            }
        }
        
        return freshActivities;
    }
    
    /**
     * Get activities near a location
     */
    public List<Activity> getActivitiesNearby(double latitude, double longitude, double radiusKm, int limit) {
        // For now, this is a simplified implementation
        // In a production system, you'd use Elasticsearch geo queries
        log.info("Getting activities near lat: {}, lng: {}, radius: {}km", latitude, longitude, radiusKm);
        
        // This would be implemented with proper geo-spatial queries in Elasticsearch
        // For now, return popular activities (placeholder implementation)
        Pageable pageable = PageRequest.of(0, limit);
        Page<Activity> activities = activityRepository.searchByQuery("popular", pageable);
        
        return activities.getContent();
    }
    
    /**
     * Search activities by text query
     */
    public Page<Activity> searchActivitiesByQuery(String query, int page, int size) {
        log.info("Searching activities with query: {}", query);
        
        Pageable pageable = PageRequest.of(page, size);
        return activityRepository.searchByQuery(query, pageable);
    }
    
    /**
     * Get popular activities for a destination
     */
    @Cacheable(value = "popular-activities", key = "#destination")
    public List<Activity> getPopularActivities(String destination, int limit) {
        log.info("Getting popular activities for: {}", destination);
        
        List<Activity> popularActivities;
        try {
            popularActivities = activityRepository.findByIsPopularTrueAndDestinationIgnoreCase(destination);
        } catch (Exception e) {
            log.warn("Elasticsearch query failed for popular activities, using external APIs: {}", e.getMessage());
            popularActivities = List.of();
        }
        
        if (popularActivities.isEmpty()) {
            // Fetch popular activities from external APIs
            popularActivities = googlePlacesService.searchActivities(destination, "popular", limit);
            
            // Mark them as popular and try to save
            popularActivities.forEach(activity -> activity.setIsPopular(true));
            if (!popularActivities.isEmpty()) {
                try {
                    activityRepository.saveAll(popularActivities);
                } catch (Exception e) {
                    log.warn("Failed to cache popular activities: {}", e.getMessage());
                }
            }
        }
        
        return popularActivities.subList(0, Math.min(limit, popularActivities.size()));
    }
    
    /**
     * Save or update an activity
     */
    public Activity saveActivity(Activity activity) {
        log.info("Saving activity: {}", activity.getName());
        return activityRepository.save(activity);
    }
    
    /**
     * Delete an activity
     */
    public void deleteActivity(String id) {
        log.info("Deleting activity with id: {}", id);
        activityRepository.deleteById(id);
    }
}