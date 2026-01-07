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
        StringBuilder fullName = new StringBuilder();
        
        if (firstName != null && !firstName.trim().isEmpty() && !"null".equals(firstName)) {
            fullName.append(firstName.trim());
        }
        
        if (lastName != null && !lastName.trim().isEmpty() && !"null".equals(lastName)) {
            if (fullName.length() > 0) {
                fullName.append(" ");
            }
            fullName.append(lastName.trim());
        }
        
        if (fullName.length() > 0) {
            return fullName.toString();
        }
        
        // Fallback to email if no name is available
        return email != null ? email : "User";
    }
}