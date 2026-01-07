package com.aspot.itinerary.repository.itinerary;

import com.aspot.itinerary.model.itinerary.Itinerary;
import com.aspot.itinerary.model.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ItineraryRepository extends JpaRepository<Itinerary, UUID> {
    List<Itinerary> findByOwner(User owner);
    List<Itinerary> findByOwnerOrderByCreatedAtDesc(User owner);
    List<Itinerary> findByDestinationContainingIgnoreCase(String destination);
    
    @Query("SELECT i FROM Itinerary i " +
           "LEFT JOIN FETCH i.owner o " +
           "WHERE i.id = :id")
    Optional<Itinerary> findByIdWithDetails(@Param("id") UUID id);
}