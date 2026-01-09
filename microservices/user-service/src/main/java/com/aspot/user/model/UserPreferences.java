package com.aspot.user.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "user_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferences {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore  // Prevent circular reference during JSON serialization
    private User user;
    
    @ElementCollection
    @CollectionTable(name = "user_interests", joinColumns = @JoinColumn(name = "preferences_id"))
    @Column(name = "interest")
    private List<String> interests;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "budget_level")
    private BudgetLevel budgetLevel;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "travel_style")
    private TravelStyle travelStyle;
    
    @ElementCollection
    @CollectionTable(name = "user_dietary_restrictions", joinColumns = @JoinColumn(name = "preferences_id"))
    @Column(name = "restriction")
    private List<String> dietaryRestrictions;
    
    @Column(name = "preferred_transport")
    private String preferredTransport;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum BudgetLevel {
        BUDGET, MID_RANGE, LUXURY
    }
    
    public enum TravelStyle {
        RELAXED, BALANCED, ADVENTURE, PACKED
    }
}