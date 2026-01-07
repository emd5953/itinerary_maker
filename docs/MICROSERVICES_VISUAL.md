# aSpot Microservices - Visual Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Next.js 15 + React 19 + TypeScript + Redux Toolkit      │ │
│  │  Port: 3000                                               │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY LAYER                        │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Spring Cloud Gateway                                     │ │
│  │  Port: 8080                                               │ │
│  │                                                           │ │
│  │  Features:                                                │ │
│  │  • Request Routing                                        │ │
│  │  • Circuit Breakers (Resilience4j)                        │ │
│  │  • Rate Limiting (Redis)                                  │ │
│  │  • JWT Authentication                                     │ │
│  │  • CORS Configuration                                     │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────┬────────────┬────────────┬────────────┬────────────────┘
         │            │            │            │
         ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MICROSERVICES LAYER                        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    USER      │  │  ITINERARY   │  │   ACTIVITY   │         │
│  │   SERVICE    │  │   SERVICE    │  │   SERVICE    │         │
│  │              │  │              │  │              │         │
│  │  Port: 8081  │  │  Port: 8082  │  │  Port: 8083  │         │
│  │              │  │              │  │              │         │
│  │  • Users     │  │  • Itinerary │  │  • Search    │         │
│  │  • Auth      │  │  • Day Plans │  │  • Recommend │         │
│  │  • Prefs     │  │  • Schedule  │  │  • Geospatial│         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                  │                 │
│         ▼                 ▼                  ▼                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ PostgreSQL   │  │ PostgreSQL   │  │Elasticsearch │         │
│  │   user_db    │  │ itinerary_db │  │  activities  │         │
│  │  Port: 5433  │  │  Port: 5434  │  │  Port: 9200  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────┐                                              │
│  │COLLABORATION │                                              │
│  │   SERVICE    │                                              │
│  │              │                                              │
│  │  Port: 8084  │                                              │
│  │              │                                              │
│  │  • Sessions  │                                              │
│  │  • Proposals │                                              │
│  │  • Voting    │                                              │
│  │  • WebSocket │                                              │
│  └──────┬───────┘                                              │
│         │                                                      │
│         ▼                                                      │
│  ┌──────────────┐                                              │
│  │ PostgreSQL   │                                              │
│  │collaboration │                                              │
│  │_db           │                                              │
│  │  Port: 5435  │                                              │
│  └──────────────┘                                              │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                         │
│                                                                 │
│  ┌──────────────────────┐                                      │
│  │       Redis          │                                      │
│  │    Port: 6379        │                                      │
│  │                      │                                      │
│  │  • Caching           │                                      │
│  │  • Rate Limiting     │                                      │
│  │  • Session Storage   │                                      │
│  └──────────────────────┘                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Service Communication Flow

### Example 1: User Creates Itinerary

```
1. Frontend
   │
   │ POST /api/itineraries
   │ { userId: 1, name: "Tokyo Trip", ... }
   ▼
2. API Gateway
   │ • Validates JWT token
   │ • Checks rate limit (Redis)
   │ • Routes to Itinerary Service
   ▼
3. Itinerary Service
   │ • Validates request
   │ • Calls User Service (verify user exists)
   │ • Calls Activity Service (fetch activity details)
   │ • Saves to PostgreSQL (itinerary_db)
   │ • Returns response
   ▼
4. API Gateway
   │ • Returns response to frontend
   ▼
5. Frontend
   • Displays new itinerary
```

### Example 2: Search Activities

```
1. Frontend
   │
   │ GET /api/activities/search?query=museum&location=Tokyo
   ▼
2. API Gateway
   │ • Validates JWT
   │ • Routes to Activity Service
   ▼
3. Activity Service
   │ • Checks Redis cache
   │ • If not cached:
   │   ├─→ Query Elasticsearch (full-text search)
   │   ├─→ Call User Service (get preferences)
   │   ├─→ Apply personalization
   │   └─→ Cache results in Redis
   │ • Returns results
   ▼
4. API Gateway
   │ • Returns to frontend
   ▼
5. Frontend
   • Displays search results
```

### Example 3: Collaboration Proposal

```
1. Frontend
   │
   │ POST /api/collaborations/{id}/proposals
   │ { type: "ADD_ACTIVITY", activityId: 123 }
   ▼
2. API Gateway
   │ • Routes to Collaboration Service
   ▼
3. Collaboration Service
   │ • Validates collaboration session
   │ • Calls User Service (verify participant)
   │ • Calls Itinerary Service (verify itinerary)
   │ • Calls Activity Service (fetch activity)
   │ • Creates proposal in PostgreSQL
   │ • Publishes event to Redis (WebSocket notification)
   │ • Returns proposal
   ▼
4. API Gateway
   │ • Returns to frontend
   ▼
5. Frontend
   • Updates UI
   • WebSocket receives real-time notification
```

## Circuit Breaker Pattern

```
┌─────────────────────────────────────────────────────────┐
│                    Circuit Breaker States               │
│                                                         │
│  ┌─────────┐                                           │
│  │ CLOSED  │ ◄──────────────────┐                      │
│  │         │                    │                      │
│  │ Normal  │                    │ Success threshold    │
│  │ Operation│                   │ reached              │
│  └────┬────┘                    │                      │
│       │                         │                      │
│       │ Failure threshold       │                      │
│       │ reached                 │                      │
│       ▼                         │                      │
│  ┌─────────┐                    │                      │
│  │  OPEN   │                    │                      │
│  │         │                    │                      │
│  │ Reject  │                    │                      │
│  │ Requests│                    │                      │
│  └────┬────┘                    │                      │
│       │                         │                      │
│       │ Wait duration           │                      │
│       │ elapsed                 │                      │
│       ▼                         │                      │
│  ┌─────────┐                    │                      │
│  │  HALF   │────────────────────┘                      │
│  │  OPEN   │                                           │
│  │         │                                           │
│  │ Test    │                                           │
│  │ Requests│                                           │
│  └─────────┘                                           │
│                                                         │
│  Configuration (per service):                          │
│  • Sliding Window: 10 requests                         │
│  • Failure Rate Threshold: 50%                         │
│  • Wait Duration: 5 seconds                            │
│  • Half-Open Calls: 3                                  │
└─────────────────────────────────────────────────────────┘
```

## Rate Limiting

```
┌─────────────────────────────────────────────────────────┐
│                    Rate Limiting (Redis)                │
│                                                         │
│  User Service:                                          │
│  ├─ Replenish Rate: 10 requests/second                 │
│  └─ Burst Capacity: 20 requests                        │
│                                                         │
│  Itinerary Service:                                     │
│  ├─ Replenish Rate: 10 requests/second                 │
│  └─ Burst Capacity: 20 requests                        │
│                                                         │
│  Activity Service:                                      │
│  ├─ Replenish Rate: 20 requests/second (higher)        │
│  └─ Burst Capacity: 40 requests                        │
│                                                         │
│  Collaboration Service:                                 │
│  ├─ Replenish Rate: 10 requests/second                 │
│  └─ Burst Capacity: 20 requests                        │
│                                                         │
│  Implementation:                                        │
│  • Token bucket algorithm                              │
│  • Per-user rate limiting                              │
│  • Redis for distributed rate limiting                 │
│  • 429 Too Many Requests response                      │
└─────────────────────────────────────────────────────────┘
```

## Database Per Service Pattern

```
┌─────────────────────────────────────────────────────────┐
│              Database Isolation Benefits                │
│                                                         │
│  ✅ Service Independence                                │
│     Each service owns its data                          │
│                                                         │
│  ✅ Technology Flexibility                              │
│     Use best database for each service                  │
│     (PostgreSQL, Elasticsearch, etc.)                   │
│                                                         │
│  ✅ Scalability                                         │
│     Scale databases independently                       │
│                                                         │
│  ✅ Fault Isolation                                     │
│     Database failure affects only one service           │
│                                                         │
│  ✅ Team Autonomy                                       │
│     Teams can modify schemas independently              │
│                                                         │
│  ⚠️  Challenges:                                        │
│     • No foreign keys across services                   │
│     • Eventual consistency                              │
│     • Distributed transactions (use Saga pattern)       │
└─────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                       │
│                                                         │
│  Development:                                           │
│  • All services in one compose file                     │
│  • Shared network                                       │
│  • Volume persistence                                   │
│  • Health checks                                        │
│                                                         │
│  Production (Kubernetes):                               │
│  • Each service as Deployment                           │
│  • Service discovery                                    │
│  • Horizontal Pod Autoscaling                           │
│  • Ingress for API Gateway                              │
│  • Persistent Volumes for databases                     │
│                                                         │
│  Cloud (AWS/GCP/Azure):                                 │
│  • Container orchestration (ECS/Cloud Run/AKS)          │
│  • Managed databases (RDS/Cloud SQL/Azure DB)           │
│  • Managed cache (ElastiCache/Memorystore/Azure Cache)  │
│  • Load balancers                                       │
│  • Auto-scaling groups                                  │
└─────────────────────────────────────────────────────────┘
```

## Monitoring & Observability

```
┌─────────────────────────────────────────────────────────┐
│                    Health Checks                        │
│                                                         │
│  Each service exposes:                                  │
│  • /actuator/health - Overall health                    │
│  • /actuator/metrics - Prometheus metrics               │
│  • /actuator/info - Service information                 │
│                                                         │
│  Monitored by:                                          │
│  • Docker health checks                                 │
│  • Kubernetes liveness/readiness probes                 │
│  • Prometheus scraping                                  │
│  • Grafana dashboards                                   │
│                                                         │
│  Future Enhancements:                                   │
│  • Distributed tracing (Zipkin/Jaeger)                  │
│  • Centralized logging (ELK stack)                      │
│  • APM (Application Performance Monitoring)             │
└─────────────────────────────────────────────────────────┘
```

## Key Metrics

```
┌─────────────────────────────────────────────────────────┐
│                    Service Metrics                      │
│                                                         │
│  Total Services: 5 microservices + 1 API Gateway        │
│  Total Databases: 3 PostgreSQL + 1 Elasticsearch        │
│  Total Infrastructure: Redis                            │
│  Total Containers: 10 (in Docker Compose)               │
│                                                         │
│  Lines of Code (estimated):                             │
│  • API Gateway: ~500 lines                              │
│  • User Service: ~2000 lines                            │
│  • Itinerary Service: ~2500 lines                       │
│  • Activity Service: ~2000 lines                        │
│  • Collaboration Service: ~2500 lines                   │
│  • Frontend: ~5000 lines                                │
│  Total: ~14,500 lines                                   │
│                                                         │
│  API Endpoints: 20+ REST endpoints                      │
│  Database Tables: 10+ tables                            │
│  Docker Images: 6 custom images                         │
└─────────────────────────────────────────────────────────┘
```

---

This visual guide provides a comprehensive overview of the aSpot microservices architecture for presentations and interviews.
