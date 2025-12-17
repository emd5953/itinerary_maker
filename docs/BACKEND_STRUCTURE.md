# Backend Structure Documentation

## Overview
The aSpot backend follows a clean, domain-driven architecture with clear separation of concerns.

## Package Organization

### 📁 `com.aspot.itinerary.model`
Domain entities organized by business domain:

#### `model.user/`
- `User.java` - Main user entity
- `UserPreferences.java` - Embedded user preferences

#### `model.itinerary/`
- `Itinerary.java` - Main itinerary entity
- `DayPlan.java` - Daily schedule within itinerary
- `ScheduledActivity.java` - Activities scheduled in day plans

#### `model.activity/`
- `Activity.java` - Master activity data

#### `model.collaboration/`
- `CollaborationSession.java` - Shared itinerary editing sessions
- `Proposal.java` - Activity change proposals
- `Vote.java` - Voting on proposals

#### `model.enums/`
All enums centralized:
- `ActivityCategory.java`
- `BudgetLevel.java`, `TravelStyle.java`, `PreferredTransport.java`
- `ProposalType.java`, `ProposalStatus.java`, `VoteType.java`

#### `model.valueobject/`
Embedded/value objects:
- `Location.java` - Geographic location data
- `OpeningHours.java` - Business hours
- `ItinerarySettings.java`, `CollaborationSettings.java`

### 📁 `com.aspot.itinerary.repository`
Data access layer organized by domain:

#### `repository.user/`
- `UserRepository.java`

#### `repository.itinerary/`
- `ItineraryRepository.java`

#### `repository.activity/`
- `ActivityRepository.java`

#### `repository.collaboration/`
- `CollaborationSessionRepository.java`
- `ProposalRepository.java`
- `VoteRepository.java`

### 📁 `com.aspot.itinerary.service`
Business logic layer organized by domain:

#### `service.user/`
- `UserService.java` - User management and authentication

#### `service.itinerary/`
- `ItineraryService.java` - Itinerary CRUD and management

#### `service.activity/`
- `ActivityService.java` - Activity recommendations and search

#### `service.collaboration/`
- `CollaborationService.java` - Collaboration features

### 📁 `com.aspot.itinerary.controller`
REST API controllers (to be organized by domain as they're added)

### 📁 `com.aspot.itinerary.config`
Configuration classes:
- `ElasticsearchConfig.java`
- `RedisConfig.java`

## Benefits of This Organization

1. **Domain-Driven Design**: Clear separation by business domains
2. **Scalability**: Easy to add new features within existing domains
3. **Maintainability**: Related code is grouped together
4. **Team Collaboration**: Different teams can work on different domains
5. **Testing**: Easy to test domain-specific functionality
6. **Dependency Management**: Clear dependencies between layers

## Circular Dependency Resolution

To avoid circular dependencies between entities:
- Bidirectional relationships are avoided where possible
- Repository queries are used instead of entity collections
- Example: `CollaborationSession` doesn't have a `proposals` collection; use `ProposalRepository.findByCollaborationSession()` instead

## Next Steps

As new features are added:
1. Add controllers to domain-specific packages under `controller/`
2. Add DTOs to domain-specific packages under `dto/`
3. Add validation classes under `validation/`
4. Add exception classes under `exception/`

This structure provides a solid foundation for the aSpot itinerary planning application.