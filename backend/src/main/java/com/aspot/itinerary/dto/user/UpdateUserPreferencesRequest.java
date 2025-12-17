package com.aspot.itinerary.dto.user;

import com.aspot.itinerary.model.enums.BudgetLevel;
import com.aspot.itinerary.model.enums.PreferredTransport;
import com.aspot.itinerary.model.enums.TravelStyle;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class UpdateUserPreferencesRequest {
    
    private List<String> interests;
    
    @NotNull
    private BudgetLevel budgetLevel;
    
    @NotNull
    private TravelStyle travelStyle;
    
    private List<String> dietaryRestrictions;
    
    @NotNull
    private PreferredTransport preferredTransport;
}