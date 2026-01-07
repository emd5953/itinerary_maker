package com.aspot.itinerary.service;

import com.aspot.itinerary.dto.ActivityDto;
import com.aspot.itinerary.dto.UserPreferencesDto;
import com.aspot.itinerary.model.*;
import com.aspot.itinerary.service.external.ActivityServiceClient;
import com.aspot.itinerary.service.external.UserServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ItineraryGenerationService {
    
    private final ActivityServiceClient activityServiceClient;
    private final UserServiceClient userServiceClient;
    
    /**
     * Generate a complete itinerary based on user preferences and destination
     */
    public Itinerary generateItinerary(UUID userId, String destination, LocalDate startDate, LocalDate endDate, String title) {
        log.info("Generating itinerary for user {} to {} from {} to {}", 
                userId, destination, startDate, endDate);
        
        // Get user preferences
        UserPreferencesDto preferences = userServiceClient.getUserPreferences(userId);
        if (preferences == null) {
            preferences = createDefaultPreferences();
        }
        
        // Calculate number of days
        int numberOfDays = (int) startDate.datesUntil(endDate.plusDays(1)).count();
        
        // Determine travel style from budget level
        String travelStyle = determineTravelStyle(preferences.getBudgetLevel());
        
        // Get recommended activities
        int activitiesNeeded = calculateActivitiesNeeded(numberOfDays, travelStyle);
        List<ActivityDto> recommendedActivities = activityServiceClient.getRecommendations(
                destination, preferences, activitiesNeeded);
        
        // Fallback to popular activities if no recommendations
        if (recommendedActivities.isEmpty()) {
            recommendedActivities = activityServiceClient.getPopularActivities(destination, activitiesNeeded);
        }
        
        // Create itinerary
        Itinerary itinerary = new Itinerary();
        itinerary.setTitle(title != null ? title : String.format("Trip to %s", destination));
        itinerary.setDestination(destination);
        itinerary.setStartDate(startDate);
        itinerary.setEndDate(endDate);
        itinerary.setOwnerId(userId);
        
        // Set default settings
        ItinerarySettings settings = new ItinerarySettings();
        settings.setBudgetLevel(preferences.getBudgetLevel());
        settings.setIsPublic(false);
        settings.setAllowCollaboration(true);
        itinerary.setSettings(settings);
        
        // Generate day plans
        List<DayPlan> dayPlans = generateDayPlans(recommendedActivities, startDate, endDate, travelStyle);
        itinerary.setDayPlans(dayPlans);
        
        // Set relationships
        for (DayPlan dayPlan : dayPlans) {
            dayPlan.setItinerary(itinerary);
            for (ScheduledActivity scheduledActivity : dayPlan.getActivities()) {
                scheduledActivity.setDayPlan(dayPlan);
            }
        }
        
        log.info("Generated itinerary with {} days and {} total activities", 
                dayPlans.size(), dayPlans.stream().mapToInt(dp -> dp.getActivities().size()).sum());
        
        return itinerary;
    }
    
    /**
     * Generate day plans with scheduled activities
     */
    private List<DayPlan> generateDayPlans(List<ActivityDto> activities, LocalDate startDate, 
                                         LocalDate endDate, String travelStyle) {
        List<DayPlan> dayPlans = new ArrayList<>();
        
        // Group activities by category for better distribution
        Map<ActivityCategory, List<ActivityDto>> activitiesByCategory = activities.stream()
                .collect(Collectors.groupingBy(ActivityDto::getCategory));
        
        LocalDate currentDate = startDate;
        int dayNumber = 1;
        
        while (!currentDate.isAfter(endDate)) {
            DayPlan dayPlan = new DayPlan();
            dayPlan.setDate(currentDate);
            dayPlan.setNotes(String.format("Day %d in %s", dayNumber, activities.isEmpty() ? "destination" : activities.get(0).getDestination()));
            
            // Generate activities for this day
            List<ScheduledActivity> dayActivities = generateDayActivities(
                    activitiesByCategory, travelStyle, dayNumber);
            dayPlan.setActivities(dayActivities);
            
            dayPlans.add(dayPlan);
            currentDate = currentDate.plusDays(1);
            dayNumber++;
        }
        
        return dayPlans;
    }
    
    /**
     * Generate activities for a single day
     */
    private List<ScheduledActivity> generateDayActivities(Map<ActivityCategory, List<ActivityDto>> activitiesByCategory,
                                                        String travelStyle, int dayNumber) {
        List<ScheduledActivity> scheduledActivities = new ArrayList<>();
        
        // Determine activities per day based on travel style
        int activitiesPerDay = getActivitiesPerDay(travelStyle);
        
        // Create time slots for the day
        List<TimeSlot> timeSlots = createTimeSlots(travelStyle);
        
        // Select activities for each time slot
        int activityIndex = 0;
        for (TimeSlot timeSlot : timeSlots) {
            if (activityIndex >= activitiesPerDay) break;
            
            ActivityDto activity = selectActivityForTimeSlot(activitiesByCategory, timeSlot, dayNumber);
            if (activity != null) {
                ScheduledActivity scheduledActivity = convertActivityToScheduledActivity(activity, timeSlot);
                scheduledActivities.add(scheduledActivity);
                activityIndex++;
            }
        }
        
        return scheduledActivities;
    }
    
    /**
     * Convert ActivityDto to ScheduledActivity with time slot
     */
    private ScheduledActivity convertActivityToScheduledActivity(ActivityDto activity, TimeSlot timeSlot) {
        ScheduledActivity scheduledActivity = new ScheduledActivity();
        scheduledActivity.setName(activity.getName());
        scheduledActivity.setDescription(activity.getDescription());
        scheduledActivity.setCategory(activity.getCategory());
        scheduledActivity.setLocation(activity.getLocation());
        scheduledActivity.setStartTime(timeSlot.startTime);
        scheduledActivity.setEndTime(timeSlot.endTime);
        scheduledActivity.setWebsiteUrl(activity.getWebsiteUrl());
        scheduledActivity.setRating(activity.getRating());
        scheduledActivity.setPriceRange(activity.getPriceRange());
        scheduledActivity.setTags(activity.getTags() != null ? new ArrayList<>(activity.getTags()) : new ArrayList<>());
        scheduledActivity.setActivityId(activity.getId()); // Reference to Activity Service
        
        return scheduledActivity;
    }
    
    /**
     * Select appropriate activity for a time slot
     */
    private ActivityDto selectActivityForTimeSlot(Map<ActivityCategory, List<ActivityDto>> activitiesByCategory,
                                             TimeSlot timeSlot, int dayNumber) {
        // Determine preferred categories for this time slot
        List<ActivityCategory> preferredCategories = getPreferredCategoriesForTimeSlot(timeSlot);
        
        // Try to find activity from preferred categories
        for (ActivityCategory category : preferredCategories) {
            List<ActivityDto> categoryActivities = activitiesByCategory.get(category);
            if (categoryActivities != null && !categoryActivities.isEmpty()) {
                // Use round-robin selection to distribute activities across days
                int index = (dayNumber - 1) % categoryActivities.size();
                ActivityDto selected = categoryActivities.get(index);
                
                // Remove from available activities to avoid duplicates
                categoryActivities.remove(index);
                if (categoryActivities.isEmpty()) {
                    activitiesByCategory.remove(category);
                }
                
                return selected;
            }
        }
        
        // Fallback: select any available activity
        for (List<ActivityDto> categoryActivities : activitiesByCategory.values()) {
            if (!categoryActivities.isEmpty()) {
                return categoryActivities.remove(0);
            }
        }
        
        return null;
    }
    
    /**
     * Get preferred activity categories for a time slot
     */
    private List<ActivityCategory> getPreferredCategoriesForTimeSlot(TimeSlot timeSlot) {
        List<ActivityCategory> categories = new ArrayList<>();
        
        if (timeSlot.period.equals("morning")) {
            categories.add(ActivityCategory.SIGHTS);
            categories.add(ActivityCategory.OUTDOOR);
            categories.add(ActivityCategory.CULTURE);
        } else if (timeSlot.period.equals("afternoon")) {
            categories.add(ActivityCategory.SIGHTS);
            categories.add(ActivityCategory.SHOPPING);
            categories.add(ActivityCategory.FOOD);
        } else if (timeSlot.period.equals("evening")) {
            categories.add(ActivityCategory.FOOD);
            categories.add(ActivityCategory.NIGHTLIFE);
            categories.add(ActivityCategory.CULTURE);
        }
        
        return categories;
    }
    
    /**
     * Create time slots based on travel style
     */
    private List<TimeSlot> createTimeSlots(String travelStyle) {
        List<TimeSlot> timeSlots = new ArrayList<>();
        
        switch (travelStyle.toUpperCase()) {
            case "RELAXED" -> {
                timeSlots.add(new TimeSlot(LocalTime.of(10, 0), LocalTime.of(12, 0), "morning"));
                timeSlots.add(new TimeSlot(LocalTime.of(14, 0), LocalTime.of(17, 0), "afternoon"));
                timeSlots.add(new TimeSlot(LocalTime.of(19, 0), LocalTime.of(21, 0), "evening"));
            }
            case "ADVENTURE" -> {
                timeSlots.add(new TimeSlot(LocalTime.of(9, 0), LocalTime.of(11, 30), "morning"));
                timeSlots.add(new TimeSlot(LocalTime.of(13, 0), LocalTime.of(16, 0), "afternoon"));
                timeSlots.add(new TimeSlot(LocalTime.of(17, 30), LocalTime.of(19, 30), "late_afternoon"));
                timeSlots.add(new TimeSlot(LocalTime.of(20, 0), LocalTime.of(22, 0), "evening"));
            }
            case "PACKED" -> {
                timeSlots.add(new TimeSlot(LocalTime.of(8, 0), LocalTime.of(10, 30), "early_morning"));
                timeSlots.add(new TimeSlot(LocalTime.of(11, 0), LocalTime.of(13, 0), "morning"));
                timeSlots.add(new TimeSlot(LocalTime.of(14, 0), LocalTime.of(16, 30), "afternoon"));
                timeSlots.add(new TimeSlot(LocalTime.of(17, 0), LocalTime.of(19, 0), "late_afternoon"));
                timeSlots.add(new TimeSlot(LocalTime.of(20, 0), LocalTime.of(22, 30), "evening"));
            }
            default -> {
                // Default to ADVENTURE style
                timeSlots.add(new TimeSlot(LocalTime.of(9, 0), LocalTime.of(11, 30), "morning"));
                timeSlots.add(new TimeSlot(LocalTime.of(13, 0), LocalTime.of(16, 0), "afternoon"));
                timeSlots.add(new TimeSlot(LocalTime.of(17, 30), LocalTime.of(19, 30), "late_afternoon"));
                timeSlots.add(new TimeSlot(LocalTime.of(20, 0), LocalTime.of(22, 0), "evening"));
            }
        }
        
        return timeSlots;
    }
    
    /**
     * Calculate number of activities needed based on trip length and style
     */
    private int calculateActivitiesNeeded(int numberOfDays, String travelStyle) {
        int activitiesPerDay = getActivitiesPerDay(travelStyle);
        return numberOfDays * activitiesPerDay + 5; // Extra activities for variety
    }
    
    /**
     * Get activities per day based on travel style
     */
    private int getActivitiesPerDay(String travelStyle) {
        return switch (travelStyle.toUpperCase()) {
            case "RELAXED" -> 3;
            case "ADVENTURE" -> 4;
            case "PACKED" -> 5;
            default -> 4; // Default to ADVENTURE
        };
    }
    
    /**
     * Determine travel style from budget level
     */
    private String determineTravelStyle(String budgetLevel) {
        if (budgetLevel == null) return "ADVENTURE";
        
        return switch (budgetLevel.toUpperCase()) {
            case "BUDGET" -> "RELAXED";
            case "MID_RANGE" -> "ADVENTURE";
            case "LUXURY" -> "PACKED";
            default -> "ADVENTURE";
        };
    }
    
    /**
     * Create default preferences for users without preferences
     */
    private UserPreferencesDto createDefaultPreferences() {
        UserPreferencesDto preferences = new UserPreferencesDto();
        preferences.setInterests(Arrays.asList("sights", "food", "culture"));
        preferences.setBudgetLevel("MID_RANGE");
        preferences.setPreferredLanguage("en");
        preferences.setAccessibilityNeeds(false);
        return preferences;
    }
    
    /**
     * Helper class for time slots
     */
    private static class TimeSlot {
        final LocalTime startTime;
        final LocalTime endTime;
        final String period;
        
        TimeSlot(LocalTime startTime, LocalTime endTime, String period) {
            this.startTime = startTime;
            this.endTime = endTime;
            this.period = period;
        }
    }
}