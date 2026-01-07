# aSpot Microservices

This directory contains all microservices for the aSpot application.

## 🎯 Services Overview

| Service | Port | Database | Purpose |
|---------|------|----------|---------|
| **API Gateway** | 8080 | Redis | Request routing, circuit breakers, rate limiting |
| **User Service** | 8081 | PostgreSQL (user_db) | User management & authentication |
| **Itinerary Service** | 8082 | PostgreSQL (itinerary_db) | Itinerary & day plan management |
| **Activity Service** | 8083 | Elasticsearch | Activity search & recommendations |
| **Collaboration Service** | 8084 | PostgreSQL (collaboration_db) | Real-time collaboration features |

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Start all services
docker-compose -f ../docker/docker-compose.microservices.yml up -d

# Check status
docker-compose -f ../docker/docker-compose.microservices.yml ps

# View logs
docker-compose -f ../docker/docker-compose.microservices.yml logs -f

# Stop all services
docker-compose -f ../docker/docker-compose.microservices.yml down
```

### Option 2: Local Development

**Prerequisites:**
- Java 17+
- Maven 3.6+
- Docker (for databases)

**Step 1: Start Databases**
```bash
# Start PostgreSQL instances
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

# Start Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Start Elasticsearch
docker run -d --name elasticsearch -p 9200:9200 -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.0
```

**Step 2: Start Services (in separate terminals)**

```bash
# Terminal 1 - User Service
cd microservices/user-service
mvn spring-boot:run

# Terminal 2 - Itinerary Service
cd microservices/itinerary-service
mvn spring-boot:run

# Terminal 3 - Activity Service
cd microservices/activity-service
mvn spring-boot:run

# Terminal 4 - Collaboration Service
cd microservices/collaboration-service
mvn spring-boot:run

# Terminal 5 - API Gateway
cd microservices/api-gateway
mvn spring-boot:run
```

## 🏗️ Building Services

### Build All Services

```bash
# From project root
cd microservices/api-gateway && mvn clean package && cd ../..
cd microservices/user-service && mvn clean package && cd ../..
cd microservices/itinerary-service && mvn clean package && cd ../..
cd microservices/activity-service && mvn clean package && cd ../..
cd microservices/collaboration-service && mvn clean package && cd ../..
```

### Build Docker Images

```bash
# Build all images
docker-compose -f ../docker/docker-compose.microservices.yml build

# Build specific service
docker-compose -f ../docker/docker-compose.microservices.yml build user-service
```

## 🔍 Testing Services

### Health Checks

```bash
# API Gateway
curl http://localhost:8080/actuator/health

# User Service
curl http://localhost:8081/actuator/health

# Itinerary Service
curl http://localhost:8082/actuator/health

# Activity Service
curl http://localhost:8083/actuator/health

# Collaboration Service
curl http://localhost:8084/actuator/health
```

### Test API Endpoints

```bash
# Through API Gateway (recommended)
curl http://localhost:8080/api/users/1
curl http://localhost:8080/api/itineraries/1
curl http://localhost:8080/api/activities/search?query=museum

# Direct to service (for debugging)
curl http://localhost:8081/api/users/1
```

## 📁 Service Structure

Each service follows the same structure:

```
service-name/
├── src/
│   ├── main/
│   │   ├── java/com/aspot/{service}/
│   │   │   ├── controller/     # REST controllers
│   │   │   ├── service/        # Business logic
│   │   │   ├── repository/     # Data access
│   │   │   ├── model/          # Domain entities
│   │   │   ├── dto/            # Data transfer objects
│   │   │   ├── config/         # Configuration
│   │   │   └── {Service}Application.java
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/   # Flyway migrations
│   └── test/                   # Tests
├── pom.xml
├── Dockerfile
└── README.md
```

## 🔧 Configuration

Each service can be configured via environment variables:

### User Service
- `SPRING_DATASOURCE_URL` - PostgreSQL connection URL
- `SPRING_REDIS_HOST` - Redis host
- `JWT_SECRET` - JWT signing secret

### Itinerary Service
- `SPRING_DATASOURCE_URL` - PostgreSQL connection URL
- `USER_SERVICE_URL` - User Service URL
- `ACTIVITY_SERVICE_URL` - Activity Service URL

### Activity Service
- `SPRING_ELASTICSEARCH_URIS` - Elasticsearch URLs
- `USER_SERVICE_URL` - User Service URL

### Collaboration Service
- `SPRING_DATASOURCE_URL` - PostgreSQL connection URL
- `USER_SERVICE_URL` - User Service URL
- `ITINERARY_SERVICE_URL` - Itinerary Service URL

### API Gateway
- `USER_SERVICE_URL` - User Service URL
- `ITINERARY_SERVICE_URL` - Itinerary Service URL
- `ACTIVITY_SERVICE_URL` - Activity Service URL
- `COLLABORATION_SERVICE_URL` - Collaboration Service URL

## 📊 Monitoring

### Actuator Endpoints

Each service exposes Spring Boot Actuator endpoints:

- `/actuator/health` - Health status
- `/actuator/metrics` - Prometheus metrics
- `/actuator/info` - Service information

### Logs

```bash
# View all logs
docker-compose -f ../docker/docker-compose.microservices.yml logs -f

# View specific service logs
docker-compose -f ../docker/docker-compose.microservices.yml logs -f user-service

# Last 100 lines
docker-compose -f ../docker/docker-compose.microservices.yml logs --tail=100 api-gateway
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :8080

# Linux/Mac
lsof -i :8080
```

### Database Connection Issues

```bash
# Check database containers
docker ps | grep postgres

# Check database logs
docker logs postgres-user
```

### Service Won't Start

1. Check if all dependencies are running (databases, Redis, Elasticsearch)
2. Check logs for specific errors
3. Verify port availability
4. Ensure Java 17+ is installed

## 📚 Documentation

- **[Microservices Architecture](../docs/MICROSERVICES_ARCHITECTURE.md)** - Detailed architecture
- **[Setup Guide](../docs/MICROSERVICES_SETUP.md)** - Complete setup instructions
- **[Visual Architecture](../docs/MICROSERVICES_VISUAL.md)** - Architecture diagrams
- **[Interview Prep](../INTERVIEW_CHECKLIST.md)** - Interview preparation

## 🚀 Next Steps

1. **Add Service Discovery** - Implement Eureka for dynamic service discovery
2. **Add Distributed Tracing** - Implement Zipkin/Jaeger for request tracing
3. **Add Event Bus** - Implement Kafka for event-driven architecture
4. **Add API Documentation** - Add Swagger/OpenAPI for each service
5. **Add Monitoring** - Implement Prometheus + Grafana dashboards
6. **Create Kubernetes Manifests** - Prepare for production deployment

---

**You now have a production-ready microservices architecture!** 🎉
