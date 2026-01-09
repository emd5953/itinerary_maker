package com.aspot.user.service;

import com.aspot.user.model.User;
import com.aspot.user.model.UserPreferences;
import com.aspot.user.repository.UserRepository;
import com.aspot.user.repository.UserPreferencesRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    
    private final UserRepository userRepository;
    private final UserPreferencesRepository preferencesRepository;
    
    public Optional<User> getUserById(UUID id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public Optional<User> getUserByClerkId(String clerkUserId) {
        return userRepository.findByClerkUserId(clerkUserId);
    }
    
    @Transactional
    public User createUser(String email, String name, String clerkUserId) {
        // Check if user already exists by email
        Optional<User> existingByEmail = userRepository.findByEmail(email);
        if (existingByEmail.isPresent()) {
            User existing = existingByEmail.get();
            // Update the clerkUserId if it's not set
            if (existing.getClerkUserId() == null && clerkUserId != null) {
                existing.setClerkUserId(clerkUserId);
                return userRepository.save(existing);
            }
            return existing;
        }
        
        // Check if user already exists by clerkUserId
        if (clerkUserId != null) {
            Optional<User> existingByClerkId = userRepository.findByClerkUserId(clerkUserId);
            if (existingByClerkId.isPresent()) {
                return existingByClerkId.get();
            }
        }
        
        // Create new user if none exists
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setClerkUserId(clerkUserId);
        
        User savedUser = userRepository.save(user);
        
        // Create default preferences
        createDefaultPreferences(savedUser);
        
        return savedUser;
    }
    
    public Optional<UserPreferences> getUserPreferences(UUID userId) {
        return preferencesRepository.findByUserId(userId);
    }
    
    @Transactional
    public UserPreferences updateUserPreferences(UUID userId, UserPreferences preferences) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        
        Optional<UserPreferences> existingPrefs = preferencesRepository.findByUserId(userId);
        
        if (existingPrefs.isPresent()) {
            UserPreferences existing = existingPrefs.get();
            existing.setInterests(preferences.getInterests());
            existing.setBudgetLevel(preferences.getBudgetLevel());
            existing.setTravelStyle(preferences.getTravelStyle());
            existing.setDietaryRestrictions(preferences.getDietaryRestrictions());
            existing.setPreferredTransport(preferences.getPreferredTransport());
            return preferencesRepository.save(existing);
        } else {
            preferences.setUser(user);
            return preferencesRepository.save(preferences);
        }
    }
    
    private void createDefaultPreferences(User user) {
        UserPreferences defaultPrefs = new UserPreferences();
        defaultPrefs.setUser(user);
        defaultPrefs.setInterests(Arrays.asList("museums", "restaurants", "parks"));
        defaultPrefs.setBudgetLevel(UserPreferences.BudgetLevel.MID_RANGE);
        defaultPrefs.setTravelStyle(UserPreferences.TravelStyle.BALANCED);
        defaultPrefs.setDietaryRestrictions(Arrays.asList());
        defaultPrefs.setPreferredTransport("WALKING");
        
        preferencesRepository.save(defaultPrefs);
        log.info("Created default preferences for user {}", user.getId());
    }
}