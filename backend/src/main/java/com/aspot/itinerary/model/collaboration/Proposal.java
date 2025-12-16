package com.aspot.itinerary.model.collaboration;

import com.aspot.itinerary.model.enums.ProposalStatus;
import com.aspot.itinerary.model.enums.ProposalType;
import com.aspot.itinerary.model.itinerary.ScheduledActivity;
import com.aspot.itinerary.model.user.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "proposals")
@Data
public class Proposal {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposer_id", nullable = false)
    private User proposer;
    
    @Enumerated(EnumType.STRING)
    private ProposalType type; // ADD_ACTIVITY, REMOVE_ACTIVITY, MODIFY_ACTIVITY, CHANGE_TIME
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposed_activity_id")
    private ScheduledActivity proposedActivity;
    
    @Column(columnDefinition = "TEXT")
    private String reason;
    
    // Note: Votes can be queried separately to avoid circular dependency issues
    // @OneToMany(mappedBy = "proposal", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // private List<Vote> votes = new ArrayList<>();
    
    @Enumerated(EnumType.STRING)
    private ProposalStatus status = ProposalStatus.PENDING; // PENDING, APPROVED, REJECTED
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collaboration_session_id")
    private CollaborationSession collaborationSession;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}