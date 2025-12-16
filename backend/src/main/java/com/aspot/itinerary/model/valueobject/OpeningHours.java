package com.aspot.itinerary.model.valueobject;

import jakarta.persistence.Embeddable;
import lombok.Data;

import java.time.LocalTime;

@Embeddable
@Data
public class OpeningHours {
    // Simplified opening hours - can be extended later for more complex schedules
    private LocalTime mondayOpen;
    private LocalTime mondayClose;
    private LocalTime tuesdayOpen;
    private LocalTime tuesdayClose;
    private LocalTime wednesdayOpen;
    private LocalTime wednesdayClose;
    private LocalTime thursdayOpen;
    private LocalTime thursdayClose;
    private LocalTime fridayOpen;
    private LocalTime fridayClose;
    private LocalTime saturdayOpen;
    private LocalTime saturdayClose;
    private LocalTime sundayOpen;
    private LocalTime sundayClose;
    
    // General notes about opening hours
    private String notes;
}