package com.aspot.itinerary.mapper;

import com.aspot.itinerary.dto.user.UpdateUserPreferencesRequest;
import com.aspot.itinerary.dto.user.UserProfileResponse;
import com.aspot.itinerary.model.user.User;
import com.aspot.itinerary.model.user.UserPreferences;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    
    /**
     * Convert User entity to UserProfileResponse DTO
     */
    @Mapping(target = "preferences", source = "preferences")
    UserProfileResponse toUserProfileResponse(User user);
    
    /**
     * Convert UserPreferences to UserPreferencesDto
     */
    UserProfileResponse.UserPreferencesDto toUserPreferencesDto(UserPreferences preferences);
    
    /**
     * Convert UpdateUserPreferencesRequest to UserPreferences entity
     */
    UserPreferences toUserPreferences(UpdateUserPreferencesRequest request);
    
    /**
     * Update existing UserPreferences entity from request
     */
    void updateUserPreferences(@MappingTarget UserPreferences target, UpdateUserPreferencesRequest source);
}