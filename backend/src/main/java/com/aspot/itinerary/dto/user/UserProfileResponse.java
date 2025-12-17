package com.aspot.itinerary.dto.user;

import com.aspot.itinerary.model.enums.BudgetLevel;
import com.aspot.itinerary.model.enums.PreferredTransport;
import com.aspot.itinerary.model.enums.TravelStyle;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class UserProfileResponse {
    private UUID id;
    private String email;
    private String name;
    private String profilePicture;
    private UserPreferencesDto preferences;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @Builder
    public static class UserPreferencesDto {
        private List<String> interests;
        private BudgetLevel budgetLevel;
        private TravelStyle travelStyle;
        private List<String> dietaryRestrictions;
        private PreferredTransport preferredTransport;
    }
}