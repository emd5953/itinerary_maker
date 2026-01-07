package com.aspot.itinerary.service;

import com.aspot.itinerary.model.Itinerary;
import com.aspot.itinerary.repository.ItineraryRepository;
import com.aspot.itinerary.service.external.UserServiceClient;
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
}