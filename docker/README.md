# Docker Configuration

This directory contains all Docker-related configuration files for the aSpot application.

## Files

- `docker-compose.dev.yml` - Development environment with infrastructure services only
- `docker-compose.yml` - Production environment with all services
- `Dockerfile.frontend` - Production Dockerfile for Next.js frontend

## Development Setup

### Start Infrastructure Services Only

For development, you typically want to run the database services in Docker while running the frontend and backend locally for faster development cycles:

```bash
# Start PostgreSQL, Redis, and Elasticsearch
docker-compose -f docker/docker-compose.dev.yml up -d

# Check service health
docker-compose -f docker/docker-compose.dev.yml ps

# View logs
docker-compose -f docker/docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker/docker-compose.dev.yml down
```

### Access Development Services

- **PostgreSQL**: `localhost:5432`
  - Database: `aspot_dev`
  - Username: `aspot_dev`
  - Password: `aspot_dev`

- **Redis**: `localhost:6379`

- **Elasticsearch**: `localhost:9200`

## Production Setup

### Full Application Stack

```bash
# Build and start all services
docker-compose -f docker/docker-compose.yml up -d --build

# Check service health
docker-compose -f docker/docker-compose.yml ps

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop all services
docker-compose -f docker/docker-compose.yml down
```

### Environment Variables

Create a `.env` file in the root directory for production:

```env
POSTGRES_PASSWORD=your_secure_password_here
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Service Health Checks

All services include health checks to ensure they're ready before dependent services start:

- **PostgreSQL**: Checks if database accepts connections
- **Redis**: Pings Redis server
- **Elasticsearch**: Checks cluster health endpoint

## Volumes

### Development
- `postgres_dev_data` - PostgreSQL data persistence
- `redis_dev_data` - Redis data persistence  
- `elasticsearch_dev_data` - Elasticsearch data persistence

### Production
- `postgres_data` - PostgreSQL data persistence
- `redis_data` - Redis data persistence
- `elasticsearch_data` - Elasticsearch data persistence

## Networks

- **Development**: `aspot-dev-network`
- **Production**: `aspot-network`

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 5432, 6379, and 9200 are not in use
2. **Memory issues**: Elasticsearch requires at least 512MB RAM
3. **Permission issues**: Ensure Docker has proper permissions

### Useful Commands

```bash
# Remove all containers and volumes (DESTRUCTIVE)
docker-compose -f docker/docker-compose.dev.yml down -v

# Rebuild specific service
docker-compose -f docker/docker-compose.yml up -d --build backend

# View resource usage
docker stats

# Clean up unused Docker resources
docker system prune -a
```