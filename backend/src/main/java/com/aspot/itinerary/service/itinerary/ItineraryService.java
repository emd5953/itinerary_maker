package com.aspot.itinerary.service.itinerary;

import com.aspot.itinerary.controller.ItineraryController.UpdateActivityRequest;
import com.aspot.itinerary.model.itinerary.DayPlan;
import com.aspot.itinerary.model.itinerary.Itinerary;
import com.aspot.itinerary.model.itinerary.ScheduledActivity;
import com.aspot.itinerary.model.user.User;
import com.aspot.itinerary.repository.itinerary.ItineraryRepository;
import com.aspot.itinerary.service.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service layer for itinerary-related operations.
 * Handles CRUD operations and itinerary generation.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ItineraryService {
    
    private final ItineraryRepository itineraryRepository;
    private final ItineraryGenerationService generationService;
    private final UserService userService;
    
    /**
     * Generate a new itinerary for a user
     */
    @Transactional
    public Itinerary generateItinerary(String clerkId, String destination, LocalDate startDate, LocalDate endDate) {
        log.info("Generating itinerary for user {} to {} from {} to {}", clerkId, destination, startDate, endDate);
        
        User user = userService.getOrCreateUser(clerkId);
        
        // Generate the itinerary with activities
        Itinerary itinerary = generationService.generateItinerary(user, destination, startDate, endDate);
        
        // Save to database
        Itinerary savedItinerary = itineraryRepository.save(itinerary);
        
        log.info("Generated and saved itinerary with ID: {} for user: {}", savedItinerary.getId(), user.getName());
        return savedItinerary;
    }
    
    /**
     * Get itinerary by ID
     */
    // @Cacheable(value = "itineraries", key = "#id") // Temporarily disabled due to serialization issues
    public Optional<Itinerary> getItinerary(UUID id) {
        return itineraryRepository.findByIdWithDetails(id);
    }
    
    /**
     * Get all itineraries for a user
     */
    // @Cacheable(value = "user-itineraries", key = "#clerkId") // Temporarily disabled
    public List<Itinerary> getUserItineraries(String clerkId) {
        User user = userService.getOrCreateUser(clerkId);
        return itineraryRepository.findByOwnerOrderByCreatedAtDesc(user);
    }
    
    /**
     * Update itinerary
     */
    @Transactional
    // @CacheEvict(value = {"itineraries", "user-itineraries"}, allEntries = true) // Temporarily disabled
    public Itinerary updateItinerary(UUID id, Itinerary updatedItinerary) {
        Itinerary existing = itineraryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Itinerary not found: " + id));
        
        // Update fields
        existing.setTitle(updatedItinerary.getTitle());
        
        return itineraryRepository.save(existing);
    }
    
    /**
     * Delete itinerary
     */
    @Transactional
    // @CacheEvict(value = {"itineraries", "user-itineraries"}, allEntries = true) // Temporarily disabled
    public void deleteItinerary(UUID id, String clerkId) {
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Itinerary not found: " + id));
        
        // Verify ownership
        if (!itinerary.getOwner().getClerkId().equals(clerkId)) {
            throw new SecurityException("User not authorized to delete this itinerary");
        }
        
        itineraryRepository.delete(itinerary);
        log.info("Deleted itinerary {} for user {}", id, clerkId);
    }
    
    /**
     * Get itineraries by destination for discovery
     */
    @Cacheable(value = "destination-itineraries")
    public List<Itinerary> getItinerariesByDestination(String destination, int limit) {
        return itineraryRepository.findByDestinationContainingIgnoreCase(destination)
                .stream()
                .limit(limit)
                .toList();
    }
    
    /**
     * Update a specific activity in an itinerary
     */
    @Transactional
    public Itinerary updateActivity(UUID itineraryId, UUID dayPlanId, UUID activityId, 
                                  UpdateActivityRequest request, String clerkId) {
        
        Itinerary itinerary = getItineraryWithOwnershipCheck(itineraryId, clerkId);
        
        // Find the day plan
        DayPlan dayPlan = itinerary.getDayPlans().stream()
                .filter(dp -> dp.getId().equals(dayPlanId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Day plan not found: " + dayPlanId));
        
        // Find the activity
        ScheduledActivity activity = dayPlan.getActivities().stream()
                .filter(a -> a.getId().equals(activityId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Activity not found: " + activityId));
        
        // Update activity fields
        if (request.name != null) {
            activity.setName(request.name);
        }
        if (request.description != null) {
            activity.setDescription(request.description);
        }
        if (request.startTime != null) {
            activity.setStartTime(LocalTime.parse(request.startTime));
        }
        if (request.endTime != null) {
            activity.setEndTime(LocalTime.parse(request.endTime));
        }
        if (request.websiteUrl != null) {
            activity.setWebsiteUrl(request.websiteUrl);
        }
        if (request.priceRange != null) {
            activity.setPriceRange(request.priceRange);
        }
        
        Itinerary savedItinerary = itineraryRepository.save(itinerary);
        log.info("Updated activity {} in itinerary {} for user {}", activityId, itineraryId, clerkId);
        
        return savedItinerary;
    }
    
    /**
     * Remove an activity from an itinerary
     */
    @Transactional
    public Itinerary removeActivity(UUID itineraryId, UUID dayPlanId, UUID activityId, String clerkId) {
        
        Itinerary itinerary = getItineraryWithOwnershipCheck(itineraryId, clerkId);
        
        // Find the day plan
        DayPlan dayPlan = itinerary.getDayPlans().stream()
                .filter(dp -> dp.getId().equals(dayPlanId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Day plan not found: " + dayPlanId));
        
        // Remove the activity
        boolean removed = dayPlan.getActivities().removeIf(a -> a.getId().equals(activityId));
        
        if (!removed) {
            throw new IllegalArgumentException("Activity not found: " + activityId);
        }
        
        Itinerary savedItinerary = itineraryRepository.save(itinerary);
        log.info("Removed activity {} from itinerary {} for user {}", activityId, itineraryId, clerkId);
        
        return savedItinerary;
    }
    
    /**
     * Reorder activities within a day plan
     */
    @Transactional
    public Itinerary reorderActivities(UUID itineraryId, UUID dayPlanId, List<UUID> activityIds, String clerkId) {
        
        Itinerary itinerary = getItineraryWithOwnershipCheck(itineraryId, clerkId);
        
        // Find the day plan
        DayPlan dayPlan = itinerary.getDayPlans().stream()
                .filter(dp -> dp.getId().equals(dayPlanId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Day plan not found: " + dayPlanId));
        
        // Create a map of activities by ID for quick lookup
        var activityMap = dayPlan.getActivities().stream()
                .collect(java.util.stream.Collectors.toMap(ScheduledActivity::getId, a -> a));
        
        // Verify all activity IDs exist
        if (activityIds.size() != dayPlan.getActivities().size()) {
            throw new IllegalArgumentException("Activity ID list size doesn't match existing activities");
        }
        
        for (UUID id : activityIds) {
            if (!activityMap.containsKey(id)) {
                throw new IllegalArgumentException("Activity not found: " + id);
            }
        }
        
        // Clear the existing collection and add in new order
        dayPlan.getActivities().clear();
        
        // Add activities in the new order
        for (UUID id : activityIds) {
            dayPlan.getActivities().add(activityMap.get(id));
        }
        
        Itinerary savedItinerary = itineraryRepository.save(itinerary);
        log.info("Reordered {} activities in day plan {} for user {}", 
                activityIds.size(), dayPlanId, clerkId);
        
        return savedItinerary;
    }
    
    /**
     * Helper method to get itinerary with ownership verification
     */
    private Itinerary getItineraryWithOwnershipCheck(UUID itineraryId, String clerkId) {
        Itinerary itinerary = itineraryRepository.findByIdWithDetails(itineraryId)
                .orElseThrow(() -> new IllegalArgumentException("Itinerary not found: " + itineraryId));
        
        // Verify ownership (allow anonymous-user for testing)
        if (!itinerary.getOwner().getClerkId().equals(clerkId) && !"anonymous-user".equals(clerkId)) {
            throw new SecurityException("User not authorized to modify this itinerary");
        }
        
        return itinerary;
    }
}