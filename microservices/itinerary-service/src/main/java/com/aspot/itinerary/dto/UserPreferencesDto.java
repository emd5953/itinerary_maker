package com.aspot.itinerary.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferencesDto {
    private List<String> interests;
    private String budgetLevel; // BUDGET, MID_RANGE, LUXURY
    private String preferredLanguage;
    private Boolean accessibilityNeeds;
}