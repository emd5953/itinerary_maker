package com.aspot.itinerary.model.valueobject;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class CollaborationSettings {
    // Voting threshold for automatic approval (e.g., 0.5 for 50% approval)
    private Double approvalThreshold = 0.5;
    
    // Whether proposals require owner approval regardless of votes
    private Boolean requireOwnerApproval = true;
    
    // Whether collaborators can invite other users
    private Boolean allowInvitations = false;
    
    // Maximum number of collaborators allowed
    private Integer maxCollaborators = 10;
}