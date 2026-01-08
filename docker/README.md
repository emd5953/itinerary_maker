# Docker Configuration

This directory contains Docker configuration for the aSpot microservices application.

## Files

- `docker-compose.microservices.yml` - Complete microservices architecture with all services
- `Dockerfile.frontend` - Production Dockerfile for Next.js frontend

## Microservices Setup

### Start Complete Application

```bash
# Start all microservices and infrastructure
docker-compose -f docker/docker-compose.microservices.yml up -d

# Check service health
docker-compose -f docker/docker-compose.microservices.yml ps

# View logs
docker-compose -f docker/docker-compose.microservices.yml logs -f

# Stop all services
docker-compose -f docker/docker-compose.microservices.yml down
```

### Access Services

- **Frontend**: `http://localhost:3000`
- **API Gateway**: `http://localhost:8080`
- **User Service**: `http://localhost:8081`
- **Itinerary Service**: `http://localhost:8082`
- **Activity Service**: `http://localhost:8083`
- **Collaboration Service**: `http://localhost:8084`

### Infrastructure Services

- **PostgreSQL (User DB)**: `localhost:5433`
- **PostgreSQL (Itinerary DB)**: `localhost:5434`
- **PostgreSQL (Collaboration DB)**: `localhost:5435`
- **Redis**: `localhost:6379`
- **Elasticsearch**: `localhost:9200`

## Service Health Checks

All services include health checks to ensure they're ready before dependent services start:

- **PostgreSQL**: Checks if database accepts connections
- **Redis**: Pings Redis server
- **Elasticsearch**: Checks cluster health endpoint
- **Microservices**: Spring Boot Actuator health endpoints

## Volumes

- `postgres_user_data` - User service PostgreSQL data
- `postgres_itinerary_data` - Itinerary service PostgreSQL data  
- `postgres_collaboration_data` - Collaboration service PostgreSQL data
- `redis_data` - Redis data persistence
- `elasticsearch_data` - Elasticsearch data persistence

## Networks

- **aspot-network** - All services communicate through this network

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 8080-8084, 5433-5435, 6379, and 9200 are available
2. **Memory issues**: Elasticsearch requires at least 512MB RAM
3. **Service startup order**: Services have health check dependencies to start in correct order

### Useful Commands

```bash
# Remove all containers and volumes (DESTRUCTIVE)
docker-compose -f docker/docker-compose.microservices.yml down -v

# Rebuild specific service
docker-compose -f docker/docker-compose.microservices.yml up -d --build user-service

# View resource usage
docker stats

# Clean up unused Docker resources
docker system prune -a

# View logs for specific service
docker-compose -f docker/docker-compose.microservices.yml logs -f api-gateway
```