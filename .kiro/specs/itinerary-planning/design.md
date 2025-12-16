# Design Document

## Overview

aSpot is a full-stack web application that revolutionizes travel planning through intelligent recommendations, collaborative features, and seamless scheduling. The system consists of a React/Next.js frontend, a Java Spring Boot backend, and PostgreSQL database with Redis caching and Elasticsearch search, with integrations to external APIs for maps, places, and transportation data.

The application follows a microservices-inspired architecture with clear separation between the presentation layer (Next.js), business logic layer (Spring Boot), and data persistence layer (PostgreSQL + Redis + Elasticsearch). This design enables scalability, maintainability, and the ability to integrate with multiple external service providers.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   PostgreSQL    │
│   (Next.js)     │◄──►│  (Spring Boot)  │◄──►│   (Primary DB)  │
│                 │    │                 │    │                 │
│ - React UI      │    │ - REST APIs     │    │ - Users         │
│ - Redux State   │    │ - Business      │    │ - Itineraries   │
│ - NextAuth.js   │    │   Logic         │    │ - Activities    │
└─────────────────┘    │ - Spring        │    └─────────────────┘
                       │   Security      │              │
                       └─────────────────┘              │
                              │                         │
                              ▼                         ▼
                    ┌─────────────────┐    ┌─────────────────┐
                    │  External APIs  │    │  Data Layer     │
                    │                 │    │                 │
                    │ - Google Maps   │    │ - Redis Cache   │
                    │ - Google Places │    │ - Elasticsearch │
                    │ - Transport APIs│    │ - Monitoring    │
                    └─────────────────┘    └─────────────────┘
```

### Technology Stack (ReliaQuest-Inspired)

**Frontend:**
- Next.js 15 with React 19 for server-side rendering and routing
- TypeScript for type safety
- Redux Toolkit for state management
- Tailwind CSS for styling
- NextAuth.js for authentication integration

**Backend:**
- Java 17+ with Spring Boot 3.x
- Spring Security for authentication and authorization
- Spring Data JPA for database operations
- Spring Web for REST API development
- Maven for dependency management

**Database & Storage:**
- **PostgreSQL** for primary application data (users, itineraries, collaborations)
- **Redis** for caching, session management, and real-time features
- **Elasticsearch** for activity search and recommendation indexing
- **InfluxDB** for analytics and usage metrics (optional for v2)

**Infrastructure & Monitoring:**
- **Docker** for containerization
- **Kubernetes** for orchestration (production)
- **Prometheus** for metrics collection
- **Grafana** for monitoring dashboards
- **ELK Stack** (Elasticsearch, Logstash, Kibana) for logging

**External Integrations:**
- Google Maps API for mapping and directions
- Google Places API for location data
- Transportation APIs (varies by region)

## Components and Interfaces

### Frontend Components

**Authentication Layer:**
- `AuthProvider`: Manages user authentication state
- `LoginComponent`: Handles user login with multiple providers
- `ProtectedRoute`: Ensures authenticated access to features

**Itinerary Management:**
- `ItineraryBuilder`: Main interface for creating and editing itineraries
- `ActivityCard`: Displays individual activity information
- `DayScheduler`: Organizes activities by day with drag-and-drop
- `MapView`: Interactive map showing activity locations

**Collaboration Features:**
- `ShareDialog`: Interface for sharing itineraries
- `CollaborationPanel`: Shows collaborator suggestions and votes
- `ProposalCard`: Displays activity proposals for approval

**Recommendation System:**
- `RecommendationEngine`: Fetches and displays activity suggestions
- `FilterPanel`: Allows users to refine recommendation criteria
- `ActivityDetails`: Shows detailed information about recommended activities

### Backend Services

**User Service:**
```java
@RestController
@RequestMapping("/api/users")
@Slf4j
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @PostMapping("/register")
    public ResponseEntity<UserDto> registerUser(@RequestBody @Valid CreateUserRequest request);
    
    @GetMapping("/profile")
    @Cacheable(value = "user-profiles", key = "#authentication.name")
    public ResponseEntity<UserProfileDto> getUserProfile(Authentication authentication);
    
    @PutMapping("/preferences")
    public ResponseEntity<Void> updatePreferences(
        @RequestBody @Valid UserPreferencesDto preferences,
        Authentication authentication);
}
```

**Itinerary Service:**
```java
@RestController
@RequestMapping("/api/itineraries")
public class ItineraryController {
    @PostMapping
    public ResponseEntity<ItineraryDto> createItinerary(@RequestBody CreateItineraryRequest request);
    
    @GetMapping("/{id}")
    public ResponseEntity<ItineraryDto> getItinerary(@PathVariable String id);
    
    @PutMapping("/{id}/activities")
    public ResponseEntity<Void> addActivity(@PathVariable String id, @RequestBody ActivityDto activity);
    
    @DeleteMapping("/{id}/activities/{activityId}")
    public ResponseEntity<Void> removeActivity(@PathVariable String id, @PathVariable String activityId);
}
```

**Recommendation Service:**
```java
@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {
    @PostMapping("/activities")
    public ResponseEntity<List<ActivityRecommendationDto>> getRecommendations(
        @RequestBody RecommendationRequest request);
    
    @GetMapping("/popular/{destination}")
    public ResponseEntity<List<ActivityDto>> getPopularActivities(@PathVariable String destination);
}
```

**Collaboration Service:**
```java
@RestController
@RequestMapping("/api/collaboration")
public class CollaborationController {
    @PostMapping("/share")
    public ResponseEntity<ShareLinkDto> shareItinerary(@RequestBody ShareItineraryRequest request);
    
    @PostMapping("/proposals")
    public ResponseEntity<ProposalDto> createProposal(@RequestBody CreateProposalRequest request);
    
    @PutMapping("/proposals/{id}/vote")
    public ResponseEntity<Void> voteOnProposal(@PathVariable String id, @RequestBody VoteRequest vote);
}
```

## Data Models

### User Model
```java
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String name;
    
    private String profilePicture;
    
    @Embedded
    private UserPreferences preferences;
    
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL)
    private List<Itinerary> itineraries = new ArrayList<>();
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

@Embeddable
@Data
public class UserPreferences {
    @ElementCollection
    @CollectionTable(name = "user_interests")
    private List<String> interests = new ArrayList<>(); // ["sights", "food", "outdoor", "nightlife"]
    
    @Enumerated(EnumType.STRING)
    private BudgetLevel budgetLevel; // BUDGET, MID_RANGE, LUXURY
    
    @Enumerated(EnumType.STRING)
    private TravelStyle travelStyle; // RELAXED, PACKED, ADVENTURE
    
    @ElementCollection
    @CollectionTable(name = "user_dietary_restrictions")
    private List<String> dietaryRestrictions = new ArrayList<>();
    
    @Enumerated(EnumType.STRING)
    private PreferredTransport preferredTransport; // WALKING, PUBLIC, RIDESHARE
}
```

### Itinerary Model
```java
@Entity
@Table(name = "itineraries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Itinerary {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false)
    private String destination;
    
    @Column(nullable = false)
    private LocalDate startDate;
    
    @Column(nullable = false)
    private LocalDate endDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;
    
    @ManyToMany
    @JoinTable(name = "itinerary_collaborators")
    private List<User> collaborators = new ArrayList<>();
    
    @OneToMany(mappedBy = "itinerary", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DayPlan> dayPlans = new ArrayList<>();
    
    @Embedded
    private ItinerarySettings settings;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

@Entity
@Table(name = "day_plans")
@Data
public class DayPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itinerary_id")
    private Itinerary itinerary;
    
    @OneToMany(mappedBy = "dayPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("startTime ASC")
    private List<ScheduledActivity> activities = new ArrayList<>();
    
    @Column(columnDefinition = "TEXT")
    private String notes;
}

@Entity
@Table(name = "scheduled_activities")
@Data
public class ScheduledActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    private ActivityCategory category;
    
    @Embedded
    private Location location;
    
    private LocalTime startTime;
    private LocalTime endTime;
    private Duration estimatedDuration;
    private String websiteUrl;
    private Double rating;
    private String priceRange;
    
    @ElementCollection
    @CollectionTable(name = "activity_tags")
    private List<String> tags = new ArrayList<>();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "day_plan_id")
    private DayPlan dayPlan;
}
```

### Activity Model
```java
@Entity
@Table(name = "activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    private ActivityCategory category;
    
    @Embedded
    private Location location;
    
    @Column(nullable = false)
    private String destination;
    
    @ElementCollection
    @CollectionTable(name = "activity_tags")
    private List<String> tags = new ArrayList<>();
    
    private Double rating;
    private Integer reviewCount;
    private String priceRange;
    
    @Embedded
    private OpeningHours openingHours;
    
    private String websiteUrl;
    
    @ElementCollection
    @CollectionTable(name = "activity_images")
    private List<String> imageUrls = new ArrayList<>();
    
    @Column(nullable = false)
    private Boolean isPopular = false;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // Elasticsearch indexing
    @Transient
    private Float searchScore;
}

@Embeddable
@Data
public class Location {
    @Column(nullable = false)
    private Double latitude;
    
    @Column(nullable = false)
    private Double longitude;
    
    private String address;
    private String city;
    private String country;
    private String placeId; // Google Places ID
}
```

### Collaboration Model
```java
@Entity
@Table(name = "collaboration_sessions")
@Data
public class CollaborationSession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @OneToOne
    @JoinColumn(name = "itinerary_id", nullable = false)
    private Itinerary itinerary;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;
    
    @ManyToMany
    @JoinTable(name = "session_collaborators")
    private List<User> collaborators = new ArrayList<>();
    
    @OneToMany(mappedBy = "collaborationSession", cascade = CascadeType.ALL)
    private List<Proposal> proposals = new ArrayList<>();
    
    @Embedded
    private CollaborationSettings settings;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}

@Entity
@Table(name = "proposals")
@Data
public class Proposal {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposer_id", nullable = false)
    private User proposer;
    
    @Enumerated(EnumType.STRING)
    private ProposalType type; // ADD_ACTIVITY, REMOVE_ACTIVITY, MODIFY_ACTIVITY, CHANGE_TIME
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposed_activity_id")
    private ScheduledActivity proposedActivity;
    
    @Column(columnDefinition = "TEXT")
    private String reason;
    
    @OneToMany(mappedBy = "proposal", cascade = CascadeType.ALL)
    private List<Vote> votes = new ArrayList<>();
    
    @Enumerated(EnumType.STRING)
    private ProposalStatus status = ProposalStatus.PENDING; // PENDING, APPROVED, REJECTED
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collaboration_session_id")
    private CollaborationSession collaborationSession;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*
### Property Reflection

After reviewing all identified properties, several can be consolidated to eliminate redundancy:

**Consolidations:**
- Properties 1.2, 1.3, 1.4 can be combined into a comprehensive "Itinerary data integrity" property
- Properties 2.1, 2.2, 2.3 can be combined into a comprehensive "Recommendation completeness" property  
- Properties 3.2, 3.3, 3.4 can be combined into a comprehensive "Route calculation completeness" property
- Properties 4.1, 4.3 can be combined into a comprehensive "Schedule validation" property
- Properties 6.1, 6.2 can be combined into a comprehensive "Authentication security" property

**Property 1: Itinerary template generation**
*For any* valid destination and date range, creating a new itinerary should produce a structured template with all required fields (title, destination, dates, empty day plans)
**Validates: Requirements 1.1**

**Property 2: Itinerary data integrity**
*For any* itinerary and activity operation (add, modify, delete), the operation should preserve data consistency, maintain required fields, and properly update dependent scheduling information
**Validates: Requirements 1.2, 1.3, 1.4**

**Property 3: Activity reordering consistency**
*For any* day plan with multiple activities, reordering the activities should preserve all activity data while updating sequence numbers and recalculating travel times between consecutive activities
**Validates: Requirements 1.5**

**Property 4: Recommendation completeness**
*For any* user preferences and destination, the recommendation engine should return activities that match the specified criteria, are properly categorized, and include all required information fields (description, hours, website)
**Validates: Requirements 2.1, 2.2, 2.3**

**Property 5: Recommendation integration**
*For any* recommended activity added to an itinerary, the activity should be properly integrated with existing schedule and location data without corrupting the itinerary structure
**Validates: Requirements 2.4**

**Property 6: Recommendation diversity**
*For any* destination and preference set, recommendations should include both popular attractions (high rating/review count) and off-the-beaten-path options (lower popularity metrics)
**Validates: Requirements 2.5**

**Property 7: Map marker consistency**
*For any* itinerary with activities containing location data, all activities should appear as markers on the map display
**Validates: Requirements 3.1**

**Property 8: Route calculation completeness**
*For any* two activities with valid locations, route calculation should return travel time, distance, and multiple transportation options (walking, public transit, ride-sharing) with cost estimates
**Validates: Requirements 3.2, 3.3, 3.4**

**Property 9: Travel time optimization**
*For any* set of activities planned for a single day, the system's optimized sequence should have lower total travel time than random orderings of the same activities
**Validates: Requirements 3.5**

**Property 10: Schedule validation**
*For any* activity scheduling operation, the system should assign valid date/time slots and prevent overlapping activities by suggesting alternative times when conflicts occur
**Validates: Requirements 4.1, 4.2**

**Property 11: Schedule update consistency**
*For any* activity time change, the system should validate the new schedule against existing activities and update travel calculations between affected activities
**Validates: Requirements 4.3**

**Property 12: Schedule overload detection**
*For any* day plan that exceeds reasonable activity density thresholds, the system should generate warnings and suggest rest periods
**Validates: Requirements 4.4**

**Property 13: Calendar export completeness**
*For any* itinerary exported to calendar format, the exported data should contain all scheduled activities with proper date/time information and follow standard calendar formats
**Validates: Requirements 4.5**

**Property 14: Collaboration session creation**
*For any* itinerary sharing operation, the system should create a valid collaboration session with appropriate access permissions for all specified collaborators
**Validates: Requirements 5.1**

**Property 15: Proposal workflow integrity**
*For any* collaborator suggestion, the system should create a valid proposal requiring owner approval, track votes correctly, and automatically approve activities meeting threshold requirements
**Validates: Requirements 5.2, 5.3**

**Property 16: Concurrent editing safety**
*For any* simultaneous editing operations on the same itinerary, the system should prevent data corruption and maintain consistency through proper conflict resolution
**Validates: Requirements 5.4**

**Property 17: PDF export completeness**
*For any* completed itinerary, PDF export should contain all itinerary information (activities, schedules, locations) in a readable offline format
**Validates: Requirements 5.5**

**Property 18: Authentication security**
*For any* user registration or OAuth login, the system should create secure user profiles with encrypted passwords and proper authentication tokens
**Validates: Requirements 6.1, 6.2**

**Property 19: Preference persistence and application**
*For any* user preference update, the changes should be persisted to the database and applied to subsequent recommendation requests
**Validates: Requirements 6.3**

**Property 20: Account management completeness**
*For any* authenticated user, accessing their account should display all owned itineraries with full management capabilities (view, edit, delete, share)
**Validates: Requirements 6.4**

**Property 21: Data deletion compliance**
*For any* account deletion request, the system should remove all personal data while preserving anonymized analytics data for system improvement
**Validates: Requirements 6.5**

**Property 22: Data persistence reliability**
*For any* user data storage operation, the information should be persisted to the database with proper backup mechanisms and survive system restarts
**Validates: Requirements 7.1**

**Property 23: API failure resilience**
*For any* external API failure, the system should handle the error gracefully and provide cached or alternative data when available
**Validates: Requirements 7.2**

**Property 24: API usage compliance**
*For any* mapping service integration, the system should respect rate limits and implement caching to minimize API calls
**Validates: Requirements 7.3**

**Property 25: Database consistency**
*For any* concurrent database operations, the system should maintain ACID properties and prevent data corruption
**Validates: Requirements 7.4**

**Property 26: Performance and logging standards**
*For any* user request, the system should respond within acceptable thresholds and log errors appropriately for debugging and monitoring
**Validates: Requirements 7.5**

## Error Handling

### Frontend Error Handling
- **Network Errors**: Implement retry mechanisms with exponential backoff for API calls
- **Authentication Errors**: Redirect to login page and preserve intended destination
- **Validation Errors**: Display user-friendly error messages with specific field guidance
- **Map Loading Errors**: Provide fallback to text-based location information

### Backend Error Handling
- **Database Connection Errors**: Implement connection pooling and automatic reconnection
- **External API Errors**: Use circuit breaker pattern to prevent cascade failures
- **Authentication Errors**: Return appropriate HTTP status codes with secure error messages
- **Validation Errors**: Use Spring Boot validation annotations with custom error responses

### Error Response Format
```java
public class ErrorResponse {
    private String error;
    private String message;
    private String timestamp;
    private String path;
    private Map<String, String> fieldErrors;
}
```

## Testing Strategy

### Dual Testing Approach

The system will employ both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Tests** verify specific examples, edge cases, and integration points:
- Authentication flows with different providers
- Database operations with specific data sets
- API endpoint responses with known inputs
- UI component rendering with mock data

**Property-Based Tests** verify universal properties across all inputs:
- Data integrity properties using random itinerary data
- Recommendation engine properties with generated user preferences
- Schedule optimization properties with random activity sets
- Collaboration workflow properties with simulated user interactions

### Property-Based Testing Framework

**Java Backend**: Use **jqwik** for property-based testing
- Configure each property test to run minimum 100 iterations
- Each test must reference its corresponding design property with format: `**Feature: itinerary-planning, Property {number}: {property_text}**`
- Use **TestContainers** for integration testing with real PostgreSQL and Redis instances

**Frontend**: Use **fast-check** for JavaScript property-based testing
- Generate random user interactions and verify UI consistency
- Test Redux state management with random action sequences

### Testing Configuration

```java
// Example property-based test configuration with TestContainers
@SpringBootTest
@Testcontainers
class ItineraryServicePropertyTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");
    
    @Container
    static GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine")
            .withExposedPorts(6379);
    
    @Property(tries = 100)
    @Label("Feature: itinerary-planning, Property 1: Itinerary template generation")
    void itineraryTemplateGeneration(@ForAll String destination, @ForAll LocalDate startDate, @ForAll LocalDate endDate) {
        // Test implementation with real database
    }
}
```

### Integration Testing
- Test complete user workflows from authentication to itinerary export
- Verify external API integrations with mock services
- Test database operations under concurrent load
- Validate security measures and access controls

### Performance Testing
- Load testing for concurrent user scenarios
- API response time validation
- Database query optimization verification
- Memory usage monitoring during peak operations

## Security Considerations

### Authentication and Authorization
- JWT tokens for stateless authentication between frontend and backend
- Spring Security configuration for API endpoint protection
- OAuth2 integration for Google authentication
- Role-based access control for collaboration features

### Data Protection
- Encrypt sensitive user data at rest
- Use HTTPS for all client-server communication
- Implement proper session management
- Regular security audits and dependency updates

### API Security
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration for cross-origin requests
- API key management for external service integrations

## Deployment Architecture (ReliaQuest-Style)

### Development Environment
- **Docker Compose** for local development stack (PostgreSQL, Redis, Elasticsearch)
- **TestContainers** for integration testing
- **Spring Boot DevTools** for hot reloading
- **Next.js Fast Refresh** for frontend development

### Production Deployment
- **Kubernetes** cluster for container orchestration
- **Docker** containers for all services
- **Frontend**: Vercel or AWS CloudFront + S3 for Next.js
- **Backend**: Kubernetes deployment with auto-scaling
- **Database**: AWS RDS PostgreSQL with read replicas
- **Cache**: AWS ElastiCache for Redis
- **Search**: AWS OpenSearch (Elasticsearch)

### Monitoring and Observability (Enterprise-Grade)
- **Prometheus** for metrics collection
- **Grafana** for dashboards and visualization
- **ELK Stack** (Elasticsearch, Logstash, Kibana) for centralized logging
- **Jaeger** for distributed tracing
- **PagerDuty** for alerting and incident management
- **DataDog** or **New Relic** for APM (Application Performance Monitoring)

## Scalability Considerations

### Horizontal Scaling
- Stateless backend services for easy horizontal scaling
- Load balancing for multiple backend instances
- Database sharding strategies for large user bases
- Caching layers (Redis) for frequently accessed data

### Performance Optimization
- Database indexing for common query patterns
- API response caching for external service calls
- Image optimization and lazy loading
- Code splitting and bundle optimization for frontend

### Future Enhancements
- Microservices architecture for independent service scaling
- Event-driven architecture for real-time collaboration
- Machine learning pipeline for improved recommendations
- Mobile application development for iOS and Android