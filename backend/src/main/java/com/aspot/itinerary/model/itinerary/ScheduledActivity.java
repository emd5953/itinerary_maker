package com.aspot.itinerary.model.itinerary;

import com.aspot.itinerary.model.enums.ActivityCategory;
import com.aspot.itinerary.model.valueobject.Location;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

import java.time.Duration;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "scheduled_activities")
@Data
public class ScheduledActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    private ActivityCategory category;
    
    @Embedded
    private Location location;
    
    @Column(name = "start_time")
    private LocalTime startTime;
    
    @Column(name = "end_time")
    private LocalTime endTime;
    
    @Column(name = "estimated_duration")
    private Duration estimatedDuration;
    
    @Column(name = "website_url")
    private String websiteUrl;
    
    private Double rating;
    
    @Column(name = "price_range")
    private String priceRange;
    
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "scheduled_activity_tags", joinColumns = @JoinColumn(name = "scheduled_activity_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "day_plan_id")
    @JsonBackReference
    private DayPlan dayPlan;
}