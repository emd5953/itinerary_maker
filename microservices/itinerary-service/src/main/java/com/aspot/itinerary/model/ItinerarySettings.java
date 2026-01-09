package com.aspot.itinerary.model;

import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItinerarySettings implements Serializable {
    private static final long serialVersionUID = 1L;
    private String budgetLevel; // BUDGET, MID_RANGE, LUXURY
    private Boolean isPublic = false;
    private Boolean allowCollaboration = true;
    private String timezone = "UTC";
}