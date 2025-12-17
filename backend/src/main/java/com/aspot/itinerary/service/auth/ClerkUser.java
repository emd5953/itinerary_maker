package com.aspot.itinerary.service.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClerkUser {
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String imageUrl;
    
    public String getFullName() {
        if (firstName != null && lastName != null) {
            return firstName + " " + lastName;
        } else if (firstName != null) {
            return firstName;
        } else if (lastName != null) {
            return lastName;
        }
        return email; // Fallback to email
    }
}