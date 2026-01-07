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
@CrossOrigin(origins = "*")
public class ItineraryController {
    
    private final ItineraryService itineraryService;
    private final ItineraryGenerationService generationService;
    
    /**
     * Get itinerary by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Itinerary> getItinerary(@PathVariable UUID id) {
        log.info("Getting itinerary with id: {}", id);
        
        Optional<Itinerary> itinerary = itineraryService.getItineraryById(id);
        return itinerary.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
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
            @RequestParam UUID userId,
            @RequestParam String destination,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String title) {
        
        log.info("Generating itinerary for user {} to {} from {} to {}", userId, destination, startDate, endDate);
        
        Itinerary generatedItinerary = generationService.generateItinerary(userId, destination, startDate, endDate, title);
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
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Itinerary Service is running");
    }
}