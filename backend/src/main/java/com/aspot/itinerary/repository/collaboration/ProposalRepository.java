package com.aspot.itinerary.repository.collaboration;

import com.aspot.itinerary.model.collaboration.CollaborationSession;
import com.aspot.itinerary.model.collaboration.Proposal;
import com.aspot.itinerary.model.enums.ProposalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProposalRepository extends JpaRepository<Proposal, UUID> {
    List<Proposal> findByCollaborationSession(CollaborationSession collaborationSession);
    List<Proposal> findByCollaborationSessionAndStatus(CollaborationSession collaborationSession, ProposalStatus status);
    List<Proposal> findByStatus(ProposalStatus status);
}