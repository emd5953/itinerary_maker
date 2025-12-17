package com.aspot.itinerary.service.auth;

import com.aspot.itinerary.model.user.User;
import com.aspot.itinerary.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    
    private final ClerkAuthService clerkAuthService;
    private final UserService userService;
    
    /**
     * Gets the current authenticated user's Clerk ID from the security context
     */
    public String getCurrentClerkUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("No authenticated user found");
        }
        
        return (String) authentication.getPrincipal();
    }
    
    /**
     * Gets the current authenticated user's profile from our database
     * Creates the profile if it doesn't exist
     */
    public User getCurrentUser() {
        String clerkId = getCurrentClerkUserId();
        return userService.getOrCreateUser(clerkId);
    }
    
    /**
     * Gets the current authenticated user's full information from Clerk
     */
    public ClerkUser getCurrentClerkUser() {
        String clerkId = getCurrentClerkUserId();
        return clerkAuthService.getUserInfo(clerkId);
    }
    
    /**
     * Checks if there's an authenticated user
     */
    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }
}