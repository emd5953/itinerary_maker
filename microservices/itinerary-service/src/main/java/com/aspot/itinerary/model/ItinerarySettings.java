package com.aspot.itinerary.model;

import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItinerarySettings {
    private String budgetLevel; // BUDGET, MID_RANGE, LUXURY
    private Boolean isPublic = false;
    private Boolean allowCollaboration = true;
    private String timezone = "UTC";
}