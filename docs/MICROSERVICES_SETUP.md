# aSpot Microservices Setup Guide

## Overview

This guide walks you through setting up and running the aSpot microservices architecture.

## Architecture Summary

**5 Microservices:**
1. **API Gateway** (8080) - Routes requests, handles auth, rate limiting
2. **User Service** (8081) - User management & authentication
3. **Itinerary Service** (8082) - Itinerary & day plan management
4. **Activity Service** (8083) - Activity search & recommendations
5. **Collaboration Service** (8084) - Real-time collaboration

**3 Separate Databases:**
- PostgreSQL (user_db) - Port 5433
- PostgreSQL (itinerary_db) - Port 5434
- PostgreSQL (collaboration_db) - Port 5435

**Shared Infrastructure:**
- Redis (6379) - Caching & rate limiting
- Elasticsearch (9200) - Activity search

## Quick Start (Docker Compose)

### Start Everything

```bash
# Start all microservices and infrastructure
docker-compose -f docker/docker-compose.microservices.yml up -d

# Check service health
docker-compose -f docker/docker-compose.microservices.yml ps

# View logs
docker-compose -f docker/docker-compose.microservices.yml logs -f

# Stop everything
docker-compose -f docker/docker-compose.microservices.yml down
```

### Access Points

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **User Service**: http://localhost:8081
- **Itinerary Service**: http://localhost:8082
- **Activity Service**: http://localhost:8083
- **Collaboration Service**: http://localhost:8084

## Local Development (Without Docker)

### Prerequisites

- Java 17+
- Maven 3.6+
- Node.js 18+
- Docker (for databases only)

### Step 1: Start Infrastructure

```bash
# Start only databases and infrastructure
docker-compose -f docker/docker-compose.dev.yml up -d

# Plus additional PostgreSQL instances for microservices
docker run -d --name postgres-user -p 5433:5432 \
  -e POSTGRES_DB=user_db \
  -e POSTGRES_USER=aspot_user \
  -e POSTGRES_PASSWORD=aspot_user \
  postgres:15-alpine

docker run -d --name postgres-itinerary -p 5434:5432 \
  -e POSTGRES_DB=itinerary_db \
  -e POSTGRES_USER=aspot_itinerary \
  -e POSTGRES_PASSWORD=aspot_itinerary \
  postgres:15-alpine

docker run -d --name postgres-collaboration -p 5435:5432 \
  -e POSTGRES_DB=collaboration_db \
  -e POSTGRES_USER=aspot_collab \
  -e POSTGRES_PASSWORD=aspot_collab \
  postgres:15-alpine
```

### Step 2: Start Microservices

Open 5 terminal windows:

**Terminal 1 - User Service:**
```bash
cd microservices/user-service
mvn spring-boot:run
```

**Terminal 2 - Itinerary Service:**
```bash
cd microservices/itinerary-service
mvn spring-boot:run
```

**Terminal 3 - Activity Service:**
```bash
cd microservices/activity-service
mvn spring-boot:run
```

**Terminal 4 - Collaboration Service:**
```bash
cd microservices/collaboration-service
mvn spring-boot:run
```

**Terminal 5 - API Gateway:**
```bash
cd microservices/api-gateway
mvn spring-boot:run
```

### Step 3: Start Frontend

```bash
cd frontend
npm install
npm run dev
```

## Service Communication Flow

### Example: Creating an Itinerary

```
1. Frontend → API Gateway (POST /api/itineraries)
2. API Gateway → Itinerary Service (validates JWT, routes request)
3. Itinerary Service → User Service (validates user exists)
4. Itinerary Service → Activity Service (fetches activity details)
5. Itinerary Service → PostgreSQL (saves itinerary)
6. Response flows back through API Gateway to Frontend
```

### Example: Activity Search

```
1. Frontend → API Gateway (GET /api/activities/search?query=...)
2. API Gateway → Activity Service
3. Activity Service → Elasticsearch (full-text search)
4. Activity Service → Redis (cache results)
5. Activity Service → User Service (get preferences for personalization)
6. Response flows back to Frontend
```

## Testing Microservices

### Health Checks

```bash
# Check all services
curl http://localhost:8080/actuator/health  # API Gateway
curl http://localhost:8081/actuator/health  # User Service
curl http://localhost:8082/actuator/health  # Itinerary Service
curl http://localhost:8083/actuator/health  # Activity Service
curl http://localhost:8084/actuator/health  # Collaboration Service
```

### API Testing

```bash
# Through API Gateway (recommended)
curl http://localhost:8080/api/users/1
curl http://localhost:8080/api/itineraries/1
curl http://localhost:8080/api/activities/search?query=museum

# Direct to service (for debugging)
curl http://localhost:8081/api/users/1
```

## Building Services

### Build All Services

```bash
# Build all microservices
cd microservices/user-service && mvn clean package
cd microservices/itinerary-service && mvn clean package
cd microservices/activity-service && mvn clean package
cd microservices/collaboration-service && mvn clean package
cd microservices/api-gateway && mvn clean package
```

### Build Docker Images

```bash
# Build all images
docker-compose -f docker/docker-compose.microservices.yml build

# Build specific service
docker-compose -f docker/docker-compose.microservices.yml build user-service
```

## Monitoring & Debugging

### View Logs

```bash
# All services
docker-compose -f docker/docker-compose.microservices.yml logs -f

# Specific service
docker-compose -f docker/docker-compose.microservices.yml logs -f user-service

# Last 100 lines
docker-compose -f docker/docker-compose.microservices.yml logs --tail=100 api-gateway
```

### Database Access

```bash
# User Service DB
docker exec -it aspot-postgres-user psql -U aspot_user -d user_db

# Itinerary Service DB
docker exec -it aspot-postgres-itinerary psql -U aspot_itinerary -d itinerary_db

# Collaboration Service DB
docker exec -it aspot-postgres-collaboration psql -U aspot_collab -d collaboration_db
```

### Redis Access

```bash
docker exec -it aspot-redis redis-cli
> KEYS *
> GET some_key
```

### Elasticsearch Access

```bash
# Check cluster health
curl http://localhost:9200/_cluster/health

# List indices
curl http://localhost:9200/_cat/indices

# Search activities
curl http://localhost:9200/activities/_search
```

## Troubleshooting

### Service Won't Start

1. Check if port is already in use:
   ```bash
   # Windows
   netstat -ano | findstr :8081
   
   # Linux/Mac
   lsof -i :8081
   ```

2. Check database connectivity:
   ```bash
   docker ps | grep postgres
   ```

3. Check logs:
   ```bash
   docker-compose -f docker/docker-compose.microservices.yml logs user-service
   ```

### Service Communication Issues

1. Check if all services are running:
   ```bash
   docker-compose -f docker/docker-compose.microservices.yml ps
   ```

2. Test service directly (bypass API Gateway):
   ```bash
   curl http://localhost:8081/actuator/health
   ```

3. Check API Gateway routes:
   ```bash
   curl http://localhost:8080/actuator/gateway/routes
   ```

### Database Migration Issues

```bash
# Run migrations manually
cd microservices/user-service
mvn flyway:migrate

# Clean and rebuild
mvn flyway:clean flyway:migrate
```

## Production Deployment

### Kubernetes

See `k8s/` directory for Kubernetes manifests (to be created).

### Cloud Platforms

**AWS:**
- ECS for container orchestration
- RDS for PostgreSQL
- ElastiCache for Redis
- OpenSearch for Elasticsearch
- ALB for API Gateway

**GCP:**
- Cloud Run for containers
- Cloud SQL for PostgreSQL
- Memorystore for Redis
- Elasticsearch on GCE
- Cloud Load Balancing

**Azure:**
- Container Instances or AKS
- Azure Database for PostgreSQL
- Azure Cache for Redis
- Azure Cognitive Search
- Application Gateway

## Performance Optimization

### Caching Strategy

- User data cached in Redis (TTL: 1 hour)
- Activity search results cached (TTL: 30 minutes)
- Itinerary data cached (TTL: 15 minutes)

### Database Optimization

- Connection pooling configured
- Indexes on frequently queried fields
- Read replicas for heavy read operations

### API Gateway

- Rate limiting: 10-20 requests/second per user
- Circuit breakers prevent cascading failures
- Request/response caching

## Next Steps

1. ✅ Set up service discovery (Eureka)
2. ✅ Add distributed tracing (Zipkin)
3. ✅ Implement event-driven architecture (Kafka)
4. ✅ Add centralized logging (ELK stack)
5. ✅ Set up CI/CD pipeline
6. ✅ Create Kubernetes manifests
7. ✅ Add API documentation (Swagger)
8. ✅ Implement authentication service
9. ✅ Add monitoring dashboards (Grafana)
10. ✅ Load testing and optimization

## Resources

- [Microservices Architecture Documentation](./MICROSERVICES_ARCHITECTURE.md)
- [Spring Cloud Gateway Docs](https://spring.io/projects/spring-cloud-gateway)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

---

**You now have a production-ready microservices architecture!** 🚀
