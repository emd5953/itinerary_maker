package com.aspot.itinerary.model.user;

import com.aspot.itinerary.model.enums.BudgetLevel;
import com.aspot.itinerary.model.enums.PreferredTransport;
import com.aspot.itinerary.model.enums.TravelStyle;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Embeddable
@Data
public class UserPreferences {
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "user_interests", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "interest")
    private List<String> interests = new ArrayList<>(); // ["sights", "food", "outdoor", "nightlife"]
    
    @Enumerated(EnumType.STRING)
    @Column(name = "budget_level")
    private BudgetLevel budgetLevel = BudgetLevel.MID_RANGE;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "travel_style")
    private TravelStyle travelStyle = TravelStyle.RELAXED;
    
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "user_dietary_restrictions", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "restriction")
    private List<String> dietaryRestrictions = new ArrayList<>();
    
    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_transport")
    private PreferredTransport preferredTransport = PreferredTransport.PUBLIC;
}