package com.aspot.itinerary.repository;

import com.aspot.itinerary.model.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ItineraryRepository extends JpaRepository<Itinerary, UUID> {
    
    List<Itinerary> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId);
    
    // Simplified query - just get by owner for now, collaborators can be added later
    default List<Itinerary> findByOwnerIdOrCollaboratorIdsContainingOrderByCreatedAtDesc(UUID userId) {
        return findByOwnerIdOrderByCreatedAtDesc(userId);
    }
    
    List<Itinerary> findByDestinationIgnoreCaseContaining(String destination);
    
    @Query("SELECT i FROM Itinerary i WHERE i.settings.isPublic = true ORDER BY i.createdAt DESC")
    List<Itinerary> findPublicItineraries();
}