package com.aspot.itinerary.controller;

import com.aspot.itinerary.dto.user.UpdateUserPreferencesRequest;
import com.aspot.itinerary.dto.user.UserProfileResponse;
import com.aspot.itinerary.mapper.UserMapper;
import com.aspot.itinerary.model.user.User;
import com.aspot.itinerary.model.user.UserPreferences;
import com.aspot.itinerary.service.auth.AuthenticationService;
import com.aspot.itinerary.service.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Slf4j
public class UserController {
    
    private final AuthenticationService authenticationService;
    private final UserService userService;
    private final UserMapper userMapper;
    
    /**
     * Get current user's profile
     */
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile() {
        User user = authenticationService.getCurrentUser();
        UserProfileResponse response = userMapper.toUserProfileResponse(user);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Update user preferences
     */
    @PutMapping("/preferences")
    public ResponseEntity<UserProfileResponse> updatePreferences(
            @Valid @RequestBody UpdateUserPreferencesRequest request) {
        
        String clerkId = authenticationService.getCurrentClerkUserId();
        UserPreferences preferences = userMapper.toUserPreferences(request);
        
        User updatedUser = userService.updateUserPreferences(clerkId, preferences);
        UserProfileResponse response = userMapper.toUserProfileResponse(updatedUser);
        
        log.info("Updated preferences for user: {}", updatedUser.getEmail());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Sync user data from Clerk (name, email, profile picture)
     */
    @PostMapping("/sync")
    public ResponseEntity<UserProfileResponse> syncFromClerk() {
        String clerkId = authenticationService.getCurrentClerkUserId();
        User syncedUser = userService.syncUserFromClerk(clerkId);
        UserProfileResponse response = userMapper.toUserProfileResponse(syncedUser);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Delete user profile (GDPR compliance)
     */
    @DeleteMapping("/profile")
    public ResponseEntity<Map<String, String>> deleteProfile() {
        String clerkId = authenticationService.getCurrentClerkUserId();
        userService.deleteUser(clerkId);
        
        return ResponseEntity.ok(Map.of(
            "message", "User profile deleted successfully",
            "timestamp", String.valueOf(System.currentTimeMillis())
        ));
    }
    
    /**
     * Check if user profile exists
     */
    @GetMapping("/exists")
    public ResponseEntity<Map<String, Boolean>> checkUserExists() {
        String clerkId = authenticationService.getCurrentClerkUserId();
        boolean exists = userService.userExists(clerkId);
        
        return ResponseEntity.ok(Map.of("exists", exists));
    }
}