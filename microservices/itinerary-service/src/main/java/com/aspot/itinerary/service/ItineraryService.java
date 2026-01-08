package com.aspot.itinerary.service;

import com.aspot.itinerary.model.Itinerary;
import com.aspot.itinerary.repository.ItineraryRepository;
import com.aspot.itinerary.service.external.UserServiceClient;
import com.aspot.itinerary.controller.ItineraryController;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ItineraryService {
    
    private final ItineraryRepository itineraryRepository;
    private final UserServiceClient userServiceClient;
    
    /**
     * Get itinerary by ID
     */
    @Cacheable(value = "itineraries", key = "#id")
    public Optional<Itinerary> getItineraryById(UUID id) {
        log.info("Getting itinerary with id: {}", id);
        return itineraryRepository.findById(id);
    }
    
    /**
     * Get all itineraries for a user (owned or collaborated)
     */
    @Cacheable(value = "user-itineraries", key = "#userId")
    public List<Itinerary> getUserItineraries(UUID userId) {
        log.info("Getting itineraries for user: {}", userId);
        return itineraryRepository.findByOwnerIdOrCollaboratorIdsContainingOrderByCreatedAtDesc(userId);
    }
    
    /**
     * Get itineraries owned by a user
     */
    public List<Itinerary> getOwnedItineraries(UUID userId) {
        log.info("Getting owned itineraries for user: {}", userId);
        return itineraryRepository.findByOwnerIdOrderByCreatedAtDesc(userId);
    }
    
    /**
     * Search itineraries by destination
     */
    public List<Itinerary> searchByDestination(String destination) {
        log.info("Searching itineraries for destination: {}", destination);
        return itineraryRepository.findByDestinationIgnoreCaseContaining(destination);
    }
    
    /**
     * Get public itineraries
     */
    @Cacheable(value = "public-itineraries")
    public List<Itinerary> getPublicItineraries() {
        log.info("Getting public itineraries");
        return itineraryRepository.findPublicItineraries();
    }
    
    /**
     * Create a new itinerary
     */
    @CacheEvict(value = {"user-itineraries", "public-itineraries"}, allEntries = true)
    public Itinerary createItinerary(Itinerary itinerary) {
        log.info("Creating itinerary: {} for user: {}", itinerary.getTitle(), itinerary.getOwnerId());
        
        // Validate owner exists
        if (!userServiceClient.userExists(itinerary.getOwnerId())) {
            throw new IllegalArgumentException("Owner user does not exist: " + itinerary.getOwnerId());
        }
        
        return itineraryRepository.save(itinerary);
    }
    
    /**
     * Update an existing itinerary
     */
    @CacheEvict(value = {"itineraries", "user-itineraries", "public-itineraries"}, allEntries = true)
    public Itinerary updateItinerary(UUID id, Itinerary updatedItinerary) {
        log.info("Updating itinerary: {}", id);
        
        Optional<Itinerary> existingItinerary = itineraryRepository.findById(id);
        if (existingItinerary.isEmpty()) {
            throw new IllegalArgumentException("Itinerary not found: " + id);
        }
        
        Itinerary itinerary = existingItinerary.get();
        
        // Update fields
        itinerary.setTitle(updatedItinerary.getTitle());
        itinerary.setDestination(updatedItinerary.getDestination());
        itinerary.setStartDate(updatedItinerary.getStartDate());
        itinerary.setEndDate(updatedItinerary.getEndDate());
        itinerary.setSettings(updatedItinerary.getSettings());
        
        return itineraryRepository.save(itinerary);
    }
    
    /**
     * Delete an itinerary
     */
    @CacheEvict(value = {"itineraries", "user-itineraries", "public-itineraries"}, allEntries = true)
    public void deleteItinerary(UUID id) {
        log.info("Deleting itinerary: {}", id);
        
        if (!itineraryRepository.existsById(id)) {
            throw new IllegalArgumentException("Itinerary not found: " + id);
        }
        
        itineraryRepository.deleteById(id);
    }
    
    /**
     * Add collaborator to itinerary
     */
    @CacheEvict(value = {"itineraries", "user-itineraries"}, allEntries = true)
    public Itinerary addCollaborator(UUID itineraryId, UUID collaboratorId) {
        log.info("Adding collaborator {} to itinerary {}", collaboratorId, itineraryId);
        
        Optional<Itinerary> optionalItinerary = itineraryRepository.findById(itineraryId);
        if (optionalItinerary.isEmpty()) {
            throw new IllegalArgumentException("Itinerary not found: " + itineraryId);
        }
        
        // Validate collaborator exists
        if (!userServiceClient.userExists(collaboratorId)) {
            throw new IllegalArgumentException("Collaborator user does not exist: " + collaboratorId);
        }
        
        Itinerary itinerary = optionalItinerary.get();
        if (!itinerary.getCollaboratorIds().contains(collaboratorId)) {
            itinerary.getCollaboratorIds().add(collaboratorId);
            return itineraryRepository.save(itinerary);
        }
        
        return itinerary;
    }
    
    /**
     * Remove collaborator from itinerary
     */
    @CacheEvict(value = {"itineraries", "user-itineraries"}, allEntries = true)
    public Itinerary removeCollaborator(UUID itineraryId, UUID collaboratorId) {
        log.info("Removing collaborator {} from itinerary {}", collaboratorId, itineraryId);
        
        Optional<Itinerary> optionalItinerary = itineraryRepository.findById(itineraryId);
        if (optionalItinerary.isEmpty()) {
            throw new IllegalArgumentException("Itinerary not found: " + itineraryId);
        }
        
        Itinerary itinerary = optionalItinerary.get();
        itinerary.getCollaboratorIds().remove(collaboratorId);
        
        return itineraryRepository.save(itinerary);
    }
    
    /**
     * Check if user has access to itinerary (owner or collaborator)
     */
    public boolean hasAccess(UUID itineraryId, UUID userId) {
        Optional<Itinerary> optionalItinerary = itineraryRepository.findById(itineraryId);
        if (optionalItinerary.isEmpty()) {
            return false;
        }
        
        Itinerary itinerary = optionalItinerary.get();
        return itinerary.getOwnerId().equals(userId) || 
               itinerary.getCollaboratorIds().contains(userId);
    }
    
    /**
     * Add an activity to a day plan
     */
    @CacheEvict(value = {"itineraries", "user-itineraries"}, allEntries = true)
    public Itinerary addActivity(UUID itineraryId, UUID dayPlanId, 
                                ItineraryController.AddActivityRequest request) {
        
        Optional<Itinerary> optionalItinerary = itineraryRepository.findById(itineraryId);
        if (optionalItinerary.isEmpty()) {
            throw new IllegalArgumentException("Itinerary not found: " + itineraryId);
        }
        
        Itinerary itinerary = optionalItinerary.get();
        
        // Find the day plan
        var dayPlan = itinerary.getDayPlans().stream()
                .filter(dp -> dp.getId().equals(dayPlanId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Day plan not found: " + dayPlanId));
        
        // Convert ActivityDto to ScheduledActivity
        var scheduledActivity = new com.aspot.itinerary.model.ScheduledActivity();
        scheduledActivity.setId(UUID.randomUUID());
        scheduledActivity.setName(request.activity.name);
        scheduledActivity.setDescription(request.activity.description);
        
        // Convert category string to enum
        if (request.activity.category != null) {
            try {
                scheduledActivity.setCategory(com.aspot.itinerary.model.ActivityCategory.valueOf(request.activity.category.toUpperCase()));
            } catch (IllegalArgumentException e) {
                scheduledActivity.setCategory(com.aspot.itinerary.model.ActivityCategory.SIGHTS); // default
            }
        }
        
        scheduledActivity.setRating(request.activity.rating);
        scheduledActivity.setPriceRange(request.activity.priceRange);
        scheduledActivity.setWebsiteUrl(request.activity.websiteUrl);
        scheduledActivity.setStartTime(java.time.LocalTime.parse(request.startTime));
        scheduledActivity.setEndTime(java.time.LocalTime.parse(request.endTime));
        scheduledActivity.setDayPlan(dayPlan);
        
        // Copy location (without placeId since it doesn't exist in microservices model)
        if (request.activity.location != null) {
            var location = new com.aspot.itinerary.model.Location();
            location.setLatitude(request.activity.location.latitude);
            location.setLongitude(request.activity.location.longitude);
            location.setAddress(request.activity.location.address);
            location.setCity(request.activity.location.city);
            location.setCountry(request.activity.location.country);
            scheduledActivity.setLocation(location);
        }
        
        // Add to day plan
        dayPlan.getActivities().add(scheduledActivity);
        
        // Sort activities by start time
        dayPlan.getActivities().sort((a, b) -> a.getStartTime().compareTo(b.getStartTime()));
        
        Itinerary savedItinerary = itineraryRepository.save(itinerary);
        log.info("Added activity '{}' to day plan {} for itinerary {}", 
                scheduledActivity.getName(), dayPlanId, itineraryId);
        
        return savedItinerary;
    }
    
    /**
     * Update a specific activity in an itinerary
     */
    @CacheEvict(value = {"itineraries", "user-itineraries"}, allEntries = true)
    public Itinerary updateActivity(UUID itineraryId, UUID dayPlanId, UUID activityId,
                                   ItineraryController.UpdateActivityRequest request) {
        
        Optional<Itinerary> optionalItinerary = itineraryRepository.findById(itineraryId);
        if (optionalItinerary.isEmpty()) {
            throw new IllegalArgumentException("Itinerary not found: " + itineraryId);
        }
        
        Itinerary itinerary = optionalItinerary.get();
        
        // Find the day plan
        var dayPlan = itinerary.getDayPlans().stream()
                .filter(dp -> dp.getId().equals(dayPlanId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Day plan not found: " + dayPlanId));
        
        // Find the activity
        var activity = dayPlan.getActivities().stream()
                .filter(a -> a.getId().equals(activityId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Activity not found: " + activityId));
        
        // Update activity fields
        if (request.name != null) activity.setName(request.name);
        if (request.description != null) activity.setDescription(request.description);
        if (request.startTime != null) activity.setStartTime(java.time.LocalTime.parse(request.startTime));
        if (request.endTime != null) activity.setEndTime(java.time.LocalTime.parse(request.endTime));
        if (request.websiteUrl != null) activity.setWebsiteUrl(request.websiteUrl);
        if (request.priceRange != null) activity.setPriceRange(request.priceRange);
        
        // Sort activities by start time
        dayPlan.getActivities().sort((a, b) -> a.getStartTime().compareTo(b.getStartTime()));
        
        Itinerary savedItinerary = itineraryRepository.save(itinerary);
        log.info("Updated activity '{}' in day plan {} for itinerary {}", 
                activity.getName(), dayPlanId, itineraryId);
        
        return savedItinerary;
    }
    
    /**
     * Remove an activity from an itinerary
     */
    @CacheEvict(value = {"itineraries", "user-itineraries"}, allEntries = true)
    public Itinerary removeActivity(UUID itineraryId, UUID dayPlanId, UUID activityId) {
        
        Optional<Itinerary> optionalItinerary = itineraryRepository.findById(itineraryId);
        if (optionalItinerary.isEmpty()) {
            throw new IllegalArgumentException("Itinerary not found: " + itineraryId);
        }
        
        Itinerary itinerary = optionalItinerary.get();
        
        // Find the day plan
        var dayPlan = itinerary.getDayPlans().stream()
                .filter(dp -> dp.getId().equals(dayPlanId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Day plan not found: " + dayPlanId));
        
        // Remove the activity
        boolean removed = dayPlan.getActivities().removeIf(a -> a.getId().equals(activityId));
        if (!removed) {
            throw new IllegalArgumentException("Activity not found: " + activityId);
        }
        
        Itinerary savedItinerary = itineraryRepository.save(itinerary);
        log.info("Removed activity {} from day plan {} for itinerary {}", 
                activityId, dayPlanId, itineraryId);
        
        return savedItinerary;
    }
    
    /**
     * Reorder activities within a day plan
     */
    @CacheEvict(value = {"itineraries", "user-itineraries"}, allEntries = true)
    public Itinerary reorderActivities(UUID itineraryId, UUID dayPlanId, List<UUID> activityIds) {
        
        Optional<Itinerary> optionalItinerary = itineraryRepository.findById(itineraryId);
        if (optionalItinerary.isEmpty()) {
            throw new IllegalArgumentException("Itinerary not found: " + itineraryId);
        }
        
        Itinerary itinerary = optionalItinerary.get();
        
        // Find the day plan
        var dayPlan = itinerary.getDayPlans().stream()
                .filter(dp -> dp.getId().equals(dayPlanId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Day plan not found: " + dayPlanId));
        
        // Create a map of activities by ID for quick lookup
        var activityMap = dayPlan.getActivities().stream()
                .collect(java.util.stream.Collectors.toMap(
                    com.aspot.itinerary.model.ScheduledActivity::getId, a -> a));
        
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
        log.info("Reordered {} activities in day plan {} for itinerary {}", 
                activityIds.size(), dayPlanId, itineraryId);
        
        return savedItinerary;
    }
}