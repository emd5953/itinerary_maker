package com.aspot.itinerary.model.valueobject;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class ItinerarySettings {
    // This can be extended later with specific settings
    // For now, keeping it simple as a placeholder for future settings
    private Boolean allowCollaboration = true;
    private Boolean publiclyVisible = false;
}