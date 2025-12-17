package com.aspot.itinerary.controller;

import com.aspot.itinerary.service.auth.AuthenticationService;
import com.aspot.itinerary.service.auth.ClerkUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthenticationService authenticationService;
    
    /**
     * Get current user information from Clerk
     */
    @GetMapping("/me")
    public ResponseEntity<ClerkUser> getCurrentClerkUser() {
        ClerkUser user = authenticationService.getCurrentClerkUser();
        return ResponseEntity.ok(user);
    }
    
    /**
     * Simple endpoint to test authentication
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testAuth() {
        String clerkId = authenticationService.getCurrentClerkUserId();
        
        return ResponseEntity.ok(Map.of(
            "message", "Authentication successful",
            "clerkId", clerkId,
            "timestamp", System.currentTimeMillis()
        ));
    }
}