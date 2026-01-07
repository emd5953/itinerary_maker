package com.aspot.itinerary.controller;

import com.aspot.itinerary.model.itinerary.Itinerary;
import com.aspot.itinerary.service.itinerary.ItineraryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/itineraries")
@RequiredArgsConstructor
@Slf4j
public class ItineraryController {
    
    private final ItineraryService itineraryService;
    
    /**
     * Generate a new itinerary
     */
    @PostMapping("/generate")
    public ResponseEntity<Itinerary> generateItinerary(
            @Valid @RequestBody GenerateItineraryRequest request,
            Authentication authentication) {
        
        // For testing purposes, allow anonymous users
        String clerkId = authentication != null ? authentication.getName() : "anonymous-user";
        log.info("Generating itinerary for user: {} to destination: {}", clerkId, request.destination);
        
        try {
            Itinerary itinerary = itineraryService.generateItinerary(
                    clerkId, 
                    request.destination, 
                    request.startDate, 
                    request.endDate
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(itinerary);
            
        } catch (Exception e) {
            log.error("Error generating itinerary: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get itinerary by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Itinerary> getItinerary(@PathVariable UUID id) {
        try {
            log.info("Fetching itinerary with ID: {}", id);
            Optional<Itinerary> itineraryOpt = itineraryService.getItinerary(id);
            
            if (itineraryOpt.isPresent()) {
                log.info("Found itinerary: {}", itineraryOpt.get().getTitle());
                return ResponseEntity.ok(itineraryOpt.get());
            } else {
                log.warn("Itinerary not found with ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error fetching itinerary with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Simple test endpoint
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        return ResponseEntity.ok(Map.of(
            "message", "Itinerary service is working",
            "timestamp", System.currentTimeMillis()
        ));
    }
    
    /**
     * Get all itineraries for the authenticated user
     */
    @GetMapping("/my")
    public ResponseEntity<List<Itinerary>> getMyItineraries(Authentication authentication) {
        String clerkId = authentication.getName();
        List<Itinerary> itineraries = itineraryService.getUserItineraries(clerkId);
        return ResponseEntity.ok(itineraries);
    }
    
    /**
     * Update itinerary
     */
    @PutMapping("/{id}")
    public ResponseEntity<Itinerary> updateItinerary(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateItineraryRequest request,
            Authentication authentication) {
        
        try {
            Itinerary updatedItinerary = new Itinerary();
            updatedItinerary.setTitle(request.title);
            
            Itinerary result = itineraryService.updateItinerary(id, updatedItinerary);
            return ResponseEntity.ok(result);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating itinerary: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Delete itinerary
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItinerary(@PathVariable UUID id, Authentication authentication) {
        String clerkId = authentication.getName();
        
        try {
            itineraryService.deleteItinerary(id, clerkId);
            return ResponseEntity.noContent().build();
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            log.error("Error deleting itinerary: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get itineraries by destination for discovery
     */
    @GetMapping("/destination/{destination}")
    public ResponseEntity<List<Itinerary>> getItinerariesByDestination(
            @PathVariable String destination,
            @RequestParam(defaultValue = "20") int limit) {
        
        List<Itinerary> itineraries = itineraryService.getItinerariesByDestination(destination, limit);
        return ResponseEntity.ok(itineraries);
    }
    
    /**
     * Request DTO for generating itinerary
     */
    public static class GenerateItineraryRequest {
        public String destination;
        public LocalDate startDate;
        public LocalDate endDate;
    }
    
    /**
     * Request DTO for updating itinerary
     */
    public static class UpdateItineraryRequest {
        public String title;
    }
}