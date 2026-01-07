package com.aspot.itinerary.service.itinerary;

import com.aspot.itinerary.model.itinerary.Itinerary;
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
}