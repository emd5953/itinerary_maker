package com.aspot.itinerary.model.collaboration;

import com.aspot.itinerary.model.itinerary.Itinerary;
import com.aspot.itinerary.model.user.User;
import com.aspot.itinerary.model.valueobject.CollaborationSettings;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "collaboration_sessions")
@Data
public class CollaborationSession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itinerary_id", nullable = false)
    private Itinerary itinerary;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "session_collaborators",
        joinColumns = @JoinColumn(name = "collaboration_session_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> collaborators = new ArrayList<>();
    
    // Note: Proposals can be queried separately to avoid circular dependency issues
    // @OneToMany(mappedBy = "collaborationSession", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // private List<Proposal> proposals = new ArrayList<>();
    
    @Embedded
    private CollaborationSettings settings;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}