package com.aspot.itinerary.dto;

import com.aspot.itinerary.model.ActivityCategory;
import com.aspot.itinerary.model.Location;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityDto {
    private String id;
    private String name;
    private String description;
    private String destination;
    private Double rating;
    private Integer reviewCount;
    private String priceRange;
    private ActivityCategory category;
    private Location location;
    private List<String> tags;
    private Boolean isPopular;
    private String imageUrl;
    private String websiteUrl;
    private String phoneNumber;
}