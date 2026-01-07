# aSpot Microservices Architecture

## Overview

This document outlines the transformation of aSpot from a monolithic backend to a true microservices architecture.

## Microservices Breakdown

### 1. **User Service** (Port: 8081)
**Responsibility:** User management, authentication, and preferences

**Technology Stack:**
- Spring Boot 3.2
- PostgreSQL (user_db)
- Redis (session management)
- JWT authentication with Clerk

**API Endpoints:**
- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/users/{id}`
- `PUT /api/users/{id}`
- `GET /api/users/{id}/preferences`
- `PUT /api/users/{id}/preferences`

**Database Tables:**
- users
- user_preferences

---

### 2. **Itinerary Service** (Port: 8082)
**Responsibility:** Itinerary and day plan management

**Technology Stack:**
- Spring Boot 3.2
- PostgreSQL (itinerary_db)
- Redis (caching)

**API Endpoints:**
- `POST /api/itineraries`
- `GET /api/itineraries/{id}`
- `PUT /api/itineraries/{id}`
- `DELETE /api/itineraries/{id}`
- `GET /api/itineraries/user/{userId}`
- `POST /api/itineraries/{id}/days`
- `PUT /api/itineraries/{id}/days/{dayId}`

**Database Tables:**
- itineraries
- day_plans
- scheduled_activities

**External Service Calls:**
- User Service (validate user ownership)
- Activity Service (fetch activity details)

---

### 3. **Activity Service** (Port: 8083)
**Responsibility:** Activity catalog, search, and recommendations

**Technology Stack:**
- Spring Boot 3.2
- Elasticsearch (primary data store)
- Redis (caching popular activities)

**API Endpoints:**
- `POST /api/activities`
- `GET /api/activities/{id}`
- `GET /api/activities/search?query=...&location=...`
- `GET /api/activities/recommendations?userId=...&location=...`
- `GET /api/activities/nearby?lat=...&lng=...&radius=...`

**Data Store:**
- Elasticsearch index: activities

**External Service Calls:**
- User Service (get user preferences for recommendations)

---

### 4. **Collaboration Service** (Port: 8084)
**Responsibility:** Real-time collaboration, proposals, and voting

**Technology Stack:**
- Spring Boot 3.2
- PostgreSQL (collaboration_db)
- Redis (real-time updates, pub/sub)
- WebSocket support

**API Endpoints:**
- `POST /api/collaborations`
- `GET /api/collaborations/{id}`
- `POST /api/collaborations/{id}/invite`
- `POST /api/collaborations/{id}/proposals`
- `POST /api/proposals/{id}/vote`
- `GET /api/proposals/{id}/votes`
- `WS /ws/collaborations/{id}` (WebSocket)

**Database Tables:**
- collaboration_sessions
- proposals
- votes

**External Service Calls:**
- User Service (validate participants)
- Itinerary Service (apply approved proposals)

---

### 5. **API Gateway** (Port: 8080)
**Responsibility:** Single entry point, routing, authentication, rate limiting

**Technology Stack:**
- Spring Cloud Gateway
- Redis (rate limiting)

**Features:**
- Route requests to appropriate microservices
- JWT validation
- Rate limiting
- CORS handling
- Request/response logging
- Circuit breaker pattern

**Routes:**
- `/api/users/**` → User Service
- `/api/itineraries/**` → Itinerary Service
- `/api/activities/**` → Activity Service
- `/api/collaborations/**` → Collaboration Service

---

## Service Communication

### Synchronous Communication (REST)
- API Gateway → Microservices (HTTP/REST)
- Service-to-Service calls (HTTP/REST with RestTemplate/WebClient)

### Asynchronous Communication (Future Enhancement)
- Kafka/RabbitMQ for event-driven architecture
- Events: UserCreated, ItineraryCreated, ProposalApproved, etc.

---

## Data Management

### Database Per Service Pattern
Each microservice has its own database:
- **user-service**: PostgreSQL (user_db)
- **itinerary-service**: PostgreSQL (itinerary_db)
- **activity-service**: Elasticsearch (activities index)
- **collaboration-service**: PostgreSQL (collaboration_db)

### Shared Data Handling
- No direct database access between services
- Use API calls for cross-service data needs
- Eventual consistency for non-critical data
- Distributed transactions avoided (use Saga pattern if needed)

---

## Infrastructure Services

### Service Discovery (Optional - Phase 2)
- Eureka Server or Consul
- Dynamic service registration and discovery

### Configuration Management (Optional - Phase 2)
- Spring Cloud Config Server
- Centralized configuration management

### Distributed Tracing (Optional - Phase 2)
- Zipkin or Jaeger
- Request tracing across services

---

## Docker Compose Architecture

```yaml
services:
  # API Gateway
  api-gateway:
    ports: ["8080:8080"]
    depends_on: [user-service, itinerary-service, activity-service, collaboration-service]
  
  # Microservices
  user-service:
    ports: ["8081:8081"]
    depends_on: [postgres-user, redis]
  
  itinerary-service:
    ports: ["8082:8082"]
    depends_on: [postgres-itinerary, redis]
  
  activity-service:
    ports: ["8083:8083"]
    depends_on: [elasticsearch, redis]
  
  collaboration-service:
    ports: ["8084:8084"]
    depends_on: [postgres-collaboration, redis]
  
  # Databases
  postgres-user:
    image: postgres:15-alpine
  
  postgres-itinerary:
    image: postgres:15-alpine
  
  postgres-collaboration:
    image: postgres:15-alpine
  
  elasticsearch:
    image: elasticsearch:8.11.0
  
  redis:
    image: redis:7-alpine
  
  # Frontend
  frontend:
    ports: ["3000:3000"]
    depends_on: [api-gateway]
```

---

## Migration Strategy

### Phase 1: Extract Services (Current)
1. Create separate Spring Boot projects for each service
2. Move domain-specific code to respective services
3. Set up separate databases
4. Implement API Gateway

### Phase 2: Service Communication
1. Implement REST clients for inter-service communication
2. Add circuit breakers (Resilience4j)
3. Implement retry logic

### Phase 3: Advanced Features
1. Add service discovery (Eureka)
2. Implement distributed tracing (Zipkin)
3. Add centralized logging (ELK stack)
4. Implement event-driven architecture (Kafka)

---

## Benefits of This Architecture

### Scalability
- Scale services independently based on load
- Activity Service can scale separately during high search traffic
- Collaboration Service can scale for real-time features

### Resilience
- Service failures are isolated
- Circuit breakers prevent cascading failures
- Graceful degradation

### Team Autonomy
- Different teams can own different services
- Independent deployment cycles
- Technology flexibility per service

### Performance
- Optimized data stores per service (Elasticsearch for search, PostgreSQL for transactions)
- Caching at service level
- Parallel processing

---

## Challenges & Solutions

### Challenge: Distributed Transactions
**Solution:** Use Saga pattern or eventual consistency

### Challenge: Data Consistency
**Solution:** Event-driven architecture with eventual consistency

### Challenge: Service Discovery
**Solution:** Use Eureka or Consul, or DNS-based discovery in Kubernetes

### Challenge: Debugging
**Solution:** Distributed tracing with Zipkin/Jaeger, centralized logging

### Challenge: Testing
**Solution:** Contract testing, integration tests with TestContainers

---

## Deployment

### Development
- Docker Compose with all services
- Local development with hot reload

### Production
- Kubernetes cluster
- Each service as a deployment
- Horizontal Pod Autoscaling
- Ingress for API Gateway

---

## Monitoring & Observability

### Metrics
- Prometheus for metrics collection
- Grafana for visualization
- Service-level metrics (latency, throughput, error rate)

### Logging
- Centralized logging with ELK stack
- Structured logging with correlation IDs

### Tracing
- Distributed tracing with Zipkin
- Request flow visualization

### Health Checks
- Spring Boot Actuator endpoints
- Kubernetes liveness and readiness probes

---

## Next Steps

1. ✅ Create microservices project structure
2. ✅ Set up API Gateway
3. ✅ Extract User Service
4. ✅ Extract Itinerary Service
5. ✅ Extract Activity Service
6. ✅ Extract Collaboration Service
7. ✅ Update Docker Compose
8. ✅ Implement inter-service communication
9. ✅ Add circuit breakers
10. ✅ Update documentation

This architecture positions aSpot as a production-ready, enterprise-grade microservices application.
