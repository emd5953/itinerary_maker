package com.aspot.itinerary.repository.collaboration;

import com.aspot.itinerary.model.collaboration.CollaborationSession;
import com.aspot.itinerary.model.itinerary.Itinerary;
import com.aspot.itinerary.model.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CollaborationSessionRepository extends JpaRepository<CollaborationSession, UUID> {
    Optional<CollaborationSession> findByItinerary(Itinerary itinerary);
    List<CollaborationSession> findByOwner(User owner);
    List<CollaborationSession> findByCollaboratorsContaining(User collaborator);
}