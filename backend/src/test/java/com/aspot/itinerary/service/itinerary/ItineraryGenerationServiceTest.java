package com.aspot.itinerary.service.itinerary;

import com.aspot.itinerary.model.enums.BudgetLevel;
import com.aspot.itinerary.model.enums.TravelStyle;
import com.aspot.itinerary.model.itinerary.Itinerary;
import com.aspot.itinerary.model.user.User;
import com.aspot.itinerary.model.user.UserPreferences;
import com.aspot.itinerary.service.recommendation.ActivityRecommendationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ItineraryGenerationServiceTest {
    
    @Mock
    private ActivityRecommendationService recommendationService;
    
    @InjectMocks
    private ItineraryGenerationService generationService;
    
    private User testUser;
    private UserPreferences testPreferences;
    
    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setName("Test User");
        testUser.setClerkId("test_clerk_id");
        
        testPreferences = new UserPreferences();
        testPreferences.setInterests(Arrays.asList("sights", "food", "culture"));
        testPreferences.setBudgetLevel(BudgetLevel.MID_RANGE);
        testPreferences.setTravelStyle(TravelStyle.ADVENTURE);
        
        testUser.setPreferences(testPreferences);
    }
    
    @Test
    void testGenerateItinerary_Success() {
        // Given
        String destination = "New York";
        LocalDate startDate = LocalDate.of(2024, 6, 1);
        LocalDate endDate = LocalDate.of(2024, 6, 3);
        
        // Mock empty recommendations (will use mock data)
        when(recommendationService.generateRecommendations(anyString(), any(), anyInt()))
                .thenReturn(Collections.emptyList());
        
        // When
        Itinerary result = generationService.generateItinerary(testUser, destination, startDate, endDate);
        
        // Then
        assertNotNull(result);
        assertEquals("Test User Trip to New York", result.getTitle());
        assertEquals(destination, result.getDestination());
        assertEquals(startDate, result.getStartDate());
        assertEquals(endDate, result.getEndDate());
        assertEquals(testUser, result.getOwner());
        
        // Should have 3 days (June 1, 2, 3)
        assertEquals(3, result.getDayPlans().size());
        
        // Each day should have date set correctly
        for (int i = 0; i < result.getDayPlans().size(); i++) {
            assertEquals(startDate.plusDays(i), result.getDayPlans().get(i).getDate());
        }
    }
    
    @Test
    void testGenerateItinerary_WithNullPreferences() {
        // Given
        testUser.setPreferences(null);
        String destination = "Paris";
        LocalDate startDate = LocalDate.of(2024, 7, 1);
        LocalDate endDate = LocalDate.of(2024, 7, 1); // Single day
        
        when(recommendationService.generateRecommendations(anyString(), any(), anyInt()))
                .thenReturn(Collections.emptyList());
        
        // When
        Itinerary result = generationService.generateItinerary(testUser, destination, startDate, endDate);
        
        // Then
        assertNotNull(result);
        assertEquals(1, result.getDayPlans().size()); // Single day trip
        assertEquals("Test User Trip to Paris", result.getTitle());
    }
    
    @Test
    void testGenerateItinerary_LongTrip() {
        // Given
        String destination = "Tokyo";
        LocalDate startDate = LocalDate.of(2024, 8, 1);
        LocalDate endDate = LocalDate.of(2024, 8, 7); // 7 days
        
        when(recommendationService.generateRecommendations(anyString(), any(), anyInt()))
                .thenReturn(Collections.emptyList());
        
        // When
        Itinerary result = generationService.generateItinerary(testUser, destination, startDate, endDate);
        
        // Then
        assertNotNull(result);
        assertEquals(7, result.getDayPlans().size());
        
        // Verify all relationships are set correctly
        for (int i = 0; i < result.getDayPlans().size(); i++) {
            assertEquals(result, result.getDayPlans().get(i).getItinerary());
        }
    }
}