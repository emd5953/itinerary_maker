package com.aspot.itinerary.model.valueobject;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class Location {
    @Column(nullable = false)
    private Double latitude;
    
    @Column(nullable = false)
    private Double longitude;
    
    private String address;
    private String city;
    private String country;
    
    @Column(name = "place_id")
    private String placeId; // Google Places ID
}