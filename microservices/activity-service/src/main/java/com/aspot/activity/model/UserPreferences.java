package com.aspot.activity.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferences {
    private List<String> interests;
    private String budgetLevel; // BUDGET, MID_RANGE, LUXURY - matches DTO from itinerary service
    private String preferredLanguage;
    private Boolean accessibilityNeeds;
    
    // Helper method to convert string to enum
    public BudgetLevel getBudgetLevelEnum() {
        if (budgetLevel == null) return BudgetLevel.MID_RANGE;
        try {
            return BudgetLevel.valueOf(budgetLevel);
        } catch (IllegalArgumentException e) {
            return BudgetLevel.MID_RANGE;
        }
    }
}