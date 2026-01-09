package com.aspot.itinerary.controller;

import com.aspot.itinerary.model.Itinerary;
import com.aspot.itinerary.service.ItineraryService;
import com.aspot.itinerary.service.ItineraryGenerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/itineraries")
@RequiredArgsConstructor
@Slf4j
public class ItineraryController {
    
    private final ItineraryService itineraryService;
    private final ItineraryGenerationService generationService;
    
    /**
     * Get current user's itineraries (temporary - no auth)
     */
    @GetMapping("/my")
    public ResponseEntity<List<Itinerary>> getMyItineraries(@RequestParam(required = false) String userId) {
        log.info("Getting itineraries for user: {}", userId);
        
        if (userId == null || userId.isEmpty()) {
            // For demo purposes, use the demo user ID
            userId = "550e8400-e29b-41d4-a716-446655440000";
        }
        
        try {
            UUID userUuid = UUID.fromString(userId);
            List<Itinerary> itineraries = itineraryService.getUserItineraries(userUuid);
            return ResponseEntity.ok(itineraries);
        } catch (IllegalArgumentException e) {
            log.error("Invalid user ID format: {}", userId);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Search itineraries by destination
     */
    @GetMapping("/search")
    public ResponseEntity<List<Itinerary>> searchItineraries(@RequestParam String destination) {
        log.info("Searching itineraries for destination: {}", destination);
        
        List<Itinerary> itineraries = itineraryService.searchByDestination(destination);
        return ResponseEntity.ok(itineraries);
    }
    
    /**
     * Get public itineraries
     */
    @GetMapping("/public")
    public ResponseEntity<List<Itinerary>> getPublicItineraries() {
        log.info("Getting public itineraries");
        
        List<Itinerary> itineraries = itineraryService.getPublicItineraries();
        return ResponseEntity.ok(itineraries);
    }
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Itinerary Service is running");
    }
    
    /**
     * Get all itineraries for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Itinerary>> getUserItineraries(@PathVariable UUID userId) {
        log.info("Getting itineraries for user: {}", userId);
        
        List<Itinerary> itineraries = itineraryService.getUserItineraries(userId);
        return ResponseEntity.ok(itineraries);
    }
    
    /**
     * Get owned itineraries for a user
     */
    @GetMapping("/user/{userId}/owned")
    public ResponseEntity<List<Itinerary>> getOwnedItineraries(@PathVariable UUID userId) {
        log.info("Getting owned itineraries for user: {}", userId);
        
        List<Itinerary> itineraries = itineraryService.getOwnedItineraries(userId);
        return ResponseEntity.ok(itineraries);
    }
    
    /**
     * Create a new itinerary manually
     */
    @PostMapping
    public ResponseEntity<Itinerary> createItinerary(@RequestBody Itinerary itinerary) {
        log.info("Creating itinerary: {} for user: {}", itinerary.getTitle(), itinerary.getOwnerId());
        
        Itinerary createdItinerary = itineraryService.createItinerary(itinerary);
        return ResponseEntity.ok(createdItinerary);
    }
    
    /**
     * Generate a new itinerary automatically
     */
    @PostMapping("/generate")
    public ResponseEntity<Itinerary> generateItinerary(
            @RequestParam String userId,
            @RequestParam String destination,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String title) {
        
        log.info("Generating itinerary for user {} to {} from {} to {}", userId, destination, startDate, endDate);
        
        // For now, convert string userId to UUID for internal processing
        // In production, this should be handled by proper user management
        UUID userUuid;
        try {
            userUuid = UUID.fromString(userId);
        } catch (IllegalArgumentException e) {
            // If it's not a UUID, create a deterministic UUID from the string
            userUuid = UUID.nameUUIDFromBytes(userId.getBytes());
            log.info("Converted string userId {} to UUID {}", userId, userUuid);
        }
        
        Itinerary generatedItinerary = generationService.generateItinerary(userUuid, destination, startDate, endDate, title);
        Itinerary savedItinerary = itineraryService.createItinerary(generatedItinerary);
        
        return ResponseEntity.ok(savedItinerary);
    }
    
    /**
     * Update an existing itinerary
     */
    @PutMapping("/{id}")
    public ResponseEntity<Itinerary> updateItinerary(@PathVariable UUID id, @RequestBody Itinerary itinerary) {
        log.info("Updating itinerary: {}", id);
        
        try {
            Itinerary updatedItinerary = itineraryService.updateItinerary(id, itinerary);
            return ResponseEntity.ok(updatedItinerary);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Delete an itinerary
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItinerary(@PathVariable UUID id) {
        log.info("Deleting itinerary: {}", id);
        
        try {
            itineraryService.deleteItinerary(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Add collaborator to itinerary
     */
    @PostMapping("/{id}/collaborators/{collaboratorId}")
    public ResponseEntity<Itinerary> addCollaborator(@PathVariable UUID id, @PathVariable UUID collaboratorId) {
        log.info("Adding collaborator {} to itinerary {}", collaboratorId, id);
        
        try {
            Itinerary updatedItinerary = itineraryService.addCollaborator(id, collaboratorId);
            return ResponseEntity.ok(updatedItinerary);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Remove collaborator from itinerary
     */
    @DeleteMapping("/{id}/collaborators/{collaboratorId}")
    public ResponseEntity<Itinerary> removeCollaborator(@PathVariable UUID id, @PathVariable UUID collaboratorId) {
        log.info("Removing collaborator {} from itinerary {}", collaboratorId, id);
        
        try {
            Itinerary updatedItinerary = itineraryService.removeCollaborator(id, collaboratorId);
            return ResponseEntity.ok(updatedItinerary);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Check if user has access to itinerary
     */
    @GetMapping("/{id}/access/{userId}")
    public ResponseEntity<Boolean> checkAccess(@PathVariable UUID id, @PathVariable UUID userId) {
        boolean hasAccess = itineraryService.hasAccess(id, userId);
        return ResponseEntity.ok(hasAccess);
    }
    
    /**
     * Add an activity to a day plan
     */
    @PostMapping("/{itineraryId}/days/{dayPlanId}/activities")
    public ResponseEntity<Itinerary> addActivity(
            @PathVariable UUID itineraryId,
            @PathVariable UUID dayPlanId,
            @RequestBody AddActivityRequest request) {
        
        log.info("Adding activity to itinerary {} day plan {}", itineraryId, dayPlanId);
        
        try {
            Itinerary updatedItinerary = itineraryService.addActivity(itineraryId, dayPlanId, request);
            return ResponseEntity.ok(updatedItinerary);
        } catch (IllegalArgumentException e) {
            log.warn("Activity addition failed: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error adding activity: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Update a specific activity in an itinerary
     */
    @PutMapping("/{itineraryId}/days/{dayPlanId}/activities/{activityId}")
    public ResponseEntity<Itinerary> updateActivity(
            @PathVariable UUID itineraryId,
            @PathVariable UUID dayPlanId,
            @PathVariable UUID activityId,
            @RequestBody UpdateActivityRequest request) {
        
        log.info("Updating activity {} in itinerary {} day plan {}", activityId, itineraryId, dayPlanId);
        
        try {
            Itinerary updatedItinerary = itineraryService.updateActivity(itineraryId, dayPlanId, activityId, request);
            return ResponseEntity.ok(updatedItinerary);
        } catch (IllegalArgumentException e) {
            log.warn("Activity update failed: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating activity: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Remove an activity from an itinerary
     */
    @DeleteMapping("/{itineraryId}/days/{dayPlanId}/activities/{activityId}")
    public ResponseEntity<Itinerary> removeActivity(
            @PathVariable UUID itineraryId,
            @PathVariable UUID dayPlanId,
            @PathVariable UUID activityId) {
        
        log.info("Removing activity {} from itinerary {} day plan {}", activityId, itineraryId, dayPlanId);
        
        try {
            Itinerary updatedItinerary = itineraryService.removeActivity(itineraryId, dayPlanId, activityId);
            return ResponseEntity.ok(updatedItinerary);
        } catch (IllegalArgumentException e) {
            log.warn("Activity removal failed: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error removing activity: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Reorder activities within a day plan
     */
    @PutMapping("/{itineraryId}/days/{dayPlanId}/reorder")
    public ResponseEntity<Itinerary> reorderActivities(
            @PathVariable UUID itineraryId,
            @PathVariable UUID dayPlanId,
            @RequestBody ReorderActivitiesRequest request) {
        
        log.info("Reordering activities in itinerary {} day plan {}", itineraryId, dayPlanId);
        
        try {
            Itinerary updatedItinerary = itineraryService.reorderActivities(itineraryId, dayPlanId, request.activityIds);
            return ResponseEntity.ok(updatedItinerary);
        } catch (IllegalArgumentException e) {
            log.warn("Activity reordering failed: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error reordering activities: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get itinerary by ID - put this at the end to avoid conflicts
     */
    @GetMapping("/{id}")
    public ResponseEntity<Itinerary> getItinerary(@PathVariable UUID id) {
        log.info("Getting itinerary with id: {}", id);
        
        Optional<Itinerary> itinerary = itineraryService.getItineraryById(id);
        return itinerary.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Request DTOs
     */
    public static class AddActivityRequest {
        public ActivityDto activity;
        public String startTime; // HH:mm:ss format
        public String endTime;   // HH:mm:ss format
    }
    
    public static class UpdateActivityRequest {
        public String name;
        public String description;
        public String startTime; // HH:mm:ss format
        public String endTime;   // HH:mm:ss format
        public String websiteUrl;
        public String priceRange;
    }
    
    public static class ReorderActivitiesRequest {
        public List<UUID> activityIds;
    }
    
    public static class ActivityDto {
        public String id;
        public String name;
        public String description;
        public String category;
        public Double rating;
        public String priceRange;
        public String websiteUrl;
        public LocationDto location;
    }
    
    public static class LocationDto {
        public Double latitude;
        public Double longitude;
        public String address;
        public String city;
        public String country;
        public String placeId;
    }
}