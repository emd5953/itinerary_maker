package com.aspot.user.controller;

import com.aspot.user.model.User;
import com.aspot.user.model.UserPreferences;
import com.aspot.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable UUID id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/users/clerk/{clerkId}")
    public ResponseEntity<User> getUserByClerkId(@PathVariable String clerkId) {
        return userService.getUserByClerkId(clerkId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/users/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        return userService.getUserByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/users/{id}/preferences")
    public ResponseEntity<UserPreferences> getUserPreferences(@PathVariable UUID id) {
        return userService.getUserPreferences(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{id}/preferences")
    public ResponseEntity<UserPreferences> updateUserPreferences(
            @PathVariable UUID id, 
            @RequestBody UserPreferences preferences) {
        try {
            UserPreferences updated = userService.updateUserPreferences(id, preferences);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody Map<String, String> request) {
        try {
            User user = userService.createUser(
                    request.get("email"),
                    request.get("name"),
                    request.get("clerkUserId")
            );
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Legacy endpoint for backward compatibility
    @GetMapping("/user/preferences")
    public ResponseEntity<Map<String, Object>> getUserPreferencesLegacy() {
        Map<String, Object> defaultPreferences = new HashMap<>();
        defaultPreferences.put("interests", java.util.Arrays.asList("museums", "restaurants", "parks"));
        defaultPreferences.put("budgetLevel", "MID_RANGE");
        defaultPreferences.put("travelStyle", "BALANCED");
        defaultPreferences.put("dietaryRestrictions", java.util.Arrays.asList());
        defaultPreferences.put("preferredTransport", "WALKING");
        
        return ResponseEntity.ok(defaultPreferences);
    }

    @PutMapping("/user/preferences")
    public ResponseEntity<Map<String, Object>> updateUserPreferencesLegacy(@RequestBody Map<String, Object> preferences) {
        System.out.println("Received preferences update: " + preferences);
        
        // Try to save to database using demo user ID
        try {
            UserPreferences userPrefs = new UserPreferences();
            userPrefs.setInterests((List<String>) preferences.get("interests"));
            userPrefs.setBudgetLevel(UserPreferences.BudgetLevel.valueOf((String) preferences.get("budgetLevel")));
            userPrefs.setTravelStyle(UserPreferences.TravelStyle.valueOf((String) preferences.get("travelStyle")));
            userPrefs.setDietaryRestrictions((List<String>) preferences.get("dietaryRestrictions"));
            userPrefs.setPreferredTransport((String) preferences.get("preferredTransport"));
            
            UUID demoUserId = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
            userService.updateUserPreferences(demoUserId, userPrefs);
            
            System.out.println("Successfully saved preferences to database");
            return ResponseEntity.ok(preferences);
        } catch (Exception e) {
            System.out.println("Failed to save preferences: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to save preferences: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}