package com.aspot.itinerary.service.user;

import com.aspot.itinerary.model.user.User;
import com.aspot.itinerary.model.user.UserPreferences;
import com.aspot.itinerary.repository.user.UserRepository;
import com.aspot.itinerary.service.auth.AuthenticationService;
import com.aspot.itinerary.service.auth.ClerkAuthService;
import com.aspot.itinerary.service.auth.ClerkUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    
    private final UserRepository userRepository;
    private final ClerkAuthService clerkAuthService;
    
    /**
     * Gets or creates a user profile for the given Clerk user ID.
     * This is called automatically when a user authenticates.
     */
    @Transactional
    public User getOrCreateUser(String clerkId) {
        // Handle anonymous users for testing
        if ("anonymous-user".equals(clerkId)) {
            return createAnonymousUser();
        }
        
        return userRepository.findByClerkId(clerkId)
                .orElseGet(() -> createUserFromClerk(clerkId));
    }
    
    /**
     * Creates an anonymous user for testing purposes
     */
    private User createAnonymousUser() {
        log.info("Creating anonymous user for testing");
        
        User user = new User();
        user.setClerkId("anonymous-user");
        user.setEmail("test@example.com");
        user.setName("Test User");
        
        // Set default preferences
        UserPreferences preferences = new UserPreferences();
        user.setPreferences(preferences);
        
        // Check if anonymous user already exists
        Optional<User> existingUser = userRepository.findByClerkId("anonymous-user");
        if (existingUser.isPresent()) {
            return existingUser.get();
        }
        
        User savedUser = userRepository.save(user);
        log.info("Created anonymous user with ID: {}", savedUser.getId());
        
        return savedUser;
    }
    
    /**
     * Creates a new user profile from Clerk user data
     */
    private User createUserFromClerk(String clerkId) {
        log.info("Creating new user profile for Clerk ID: {}", clerkId);
        
        // Fetch user data from Clerk
        ClerkUser clerkUser = clerkAuthService.getUserInfo(clerkId);
        
        // Create new user entity
        User user = new User();
        user.setClerkId(clerkId);
        user.setEmail(clerkUser.getEmail());
        user.setName(clerkUser.getFullName());
        user.setProfilePicture(clerkUser.getImageUrl());
        
        // Set default preferences
        UserPreferences preferences = new UserPreferences();
        user.setPreferences(preferences);
        
        User savedUser = userRepository.save(user);
        log.info("Created user profile with ID: {} for email: {}", savedUser.getId(), savedUser.getEmail());
        
        return savedUser;
    }
    
    /**
     * Gets user profile by Clerk ID with caching
     */
    @Cacheable(value = "users", key = "#clerkId")
    public Optional<User> getUserByClerkId(String clerkId) {
        return userRepository.findByClerkId(clerkId);
    }
    
    /**
     * Gets user profile by internal UUID
     */
    @Cacheable(value = "users", key = "#userId")
    public Optional<User> getUserById(UUID userId) {
        return userRepository.findById(userId);
    }
    
    /**
     * Updates user profile information
     */
    @Transactional
    @CacheEvict(value = "users", key = "#user.clerkId")
    public User updateUser(User user) {
        log.info("Updating user profile for ID: {}", user.getId());
        return userRepository.save(user);
    }
    
    /**
     * Updates user preferences
     */
    @Transactional
    @CacheEvict(value = "users", key = "#clerkId")
    public User updateUserPreferences(String clerkId, UserPreferences preferences) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + clerkId));
        
        user.setPreferences(preferences);
        
        log.info("Updated preferences for user: {}", user.getEmail());
        return userRepository.save(user);
    }
    
    /**
     * Syncs user data from Clerk (name, email, profile picture)
     */
    @Transactional
    @CacheEvict(value = "users", key = "#clerkId")
    public User syncUserFromClerk(String clerkId) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + clerkId));
        
        // Fetch latest data from Clerk
        ClerkUser clerkUser = clerkAuthService.getUserInfo(clerkId);
        
        // Update user data
        user.setEmail(clerkUser.getEmail());
        user.setName(clerkUser.getFullName());
        user.setProfilePicture(clerkUser.getImageUrl());
        
        log.info("Synced user data from Clerk for: {}", user.getEmail());
        return userRepository.save(user);
    }
    
    /**
     * Checks if a user exists by Clerk ID
     */
    public boolean userExists(String clerkId) {
        return userRepository.existsByClerkId(clerkId);
    }
    
    /**
     * Deletes a user profile (for GDPR compliance)
     */
    @Transactional
    @CacheEvict(value = "users", key = "#clerkId")
    public void deleteUser(String clerkId) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + clerkId));
        
        log.info("Deleting user profile for: {}", user.getEmail());
        userRepository.delete(user);
    }
}