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
    private BudgetLevel budgetLevel;
    private String preferredLanguage;
    private Boolean accessibilityNeeds;
}