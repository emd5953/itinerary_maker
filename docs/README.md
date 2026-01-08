# aSpot Documentation

Complete documentation for the aSpot travel itinerary planning application.

## 🏗️ Architecture

### Microservices
- **[Microservices Summary](./MICROSERVICES_SUMMARY.md)** - Quick overview of the architecture
- **[Microservices Architecture](./MICROSERVICES_ARCHITECTURE.md)** - Detailed architecture documentation
- **[Microservices Setup](./MICROSERVICES_SETUP.md)** - Complete setup guide
- **[Microservices Visual](./MICROSERVICES_VISUAL.md)** - Visual architecture diagrams

## 🚀 Setup Guides

### Frontend
- **[Frontend Setup](./FRONTEND_SETUP.md)** - Next.js frontend configuration and features

### Authentication
- **[Clerk Setup](./CLERK_SETUP.md)** - Authentication and user management setup

### Maps & GPS
- **[GPS Setup](./GPS_SETUP.md)** - Google Maps integration and GPS functionality

## 🎯 Features

### Core Functionality
- **[Itinerary Generation](./ITINERARY_GENERATION.md)** - AI-powered itinerary creation engine

## 📁 Project Structure

```
aSpot/
├── docs/                   # This documentation
├── microservices/         # 5 independent microservices
│   ├── api-gateway/       # Spring Cloud Gateway (Port 8080)
│   ├── user-service/      # User management (Port 8081)
│   ├── itinerary-service/ # Itinerary management (Port 8082)
│   ├── activity-service/  # Activity search (Port 8083)
│   └── collaboration-service/ # Real-time collaboration (Port 8084)
├── frontend/              # Next.js 15 + React 19 frontend
├── docker/                # Docker Compose configurations
└── .kiro/                 # Kiro IDE specifications
```

## 🎯 Quick Start

### Option 1: Full Microservices (Recommended)

```bash
# Start all services
docker-compose -f docker/docker-compose.microservices.yml up -d

# Access points:
# Frontend: http://localhost:3000
# API Gateway: http://localhost:8080
# Individual services: 8081-8084
```

### Option 2: Development Mode

```bash
# Start infrastructure only
docker run -d --name aspot-redis -p 6379:6379 redis:7-alpine
docker run -d --name aspot-elasticsearch -p 9200:9200 \
  -e discovery.type=single-node \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.0

# Start microservices individually (see setup guide)
cd microservices/api-gateway && mvn spring-boot:run
# ... repeat for each service

# Start frontend
cd frontend && npm run dev
```

## 🏆 Key Features

### True Microservices Architecture
- ✅ 5 independent Spring Boot services
- ✅ Database-per-service pattern (3 PostgreSQL + Elasticsearch)
- ✅ API Gateway with circuit breakers and rate limiting
- ✅ Service-to-service communication
- ✅ Independent deployment and scaling

### Modern Frontend
- ✅ Next.js 15 with React 19
- ✅ TypeScript and Tailwind CSS
- ✅ Clerk authentication integration
- ✅ Responsive design matching mobile app

### Advanced Features
- ✅ AI-powered itinerary generation
- ✅ Real-time collaboration
- ✅ GPS and mapping integration
- ✅ Activity recommendations
- ✅ User preference matching

## 🔧 Technology Stack

### Backend (Microservices)
- **Java 17** with Spring Boot 3.x
- **Spring Cloud Gateway** for API Gateway
- **PostgreSQL** for transactional data
- **Elasticsearch** for search functionality
- **Redis** for caching and rate limiting
- **Docker** for containerization

### Frontend
- **Next.js 15** with React 19
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Clerk** for authentication
- **Google Maps API** for GPS functionality

### Infrastructure
- **Docker Compose** for local development
- **Kubernetes-ready** for production deployment
- **Health checks** and monitoring
- **Circuit breakers** for resilience

## 📊 Service Overview

| Service | Port | Database | Purpose |
|---------|------|----------|---------|
| API Gateway | 8080 | Redis | Request routing, auth, rate limiting |
| User Service | 8081 | PostgreSQL (user_db) | User management & preferences |
| Itinerary Service | 8082 | PostgreSQL (itinerary_db) | Itinerary & day plan management |
| Activity Service | 8083 | Elasticsearch | Activity search & recommendations |
| Collaboration Service | 8084 | PostgreSQL (collaboration_db) | Real-time collaboration |
| Frontend | 3000 | - | Next.js web application |

## 🎯 For Interviews

This project demonstrates:

### Microservices Expertise
- **Service decomposition** - Proper domain boundaries
- **Data management** - Database-per-service pattern
- **Communication** - REST APIs with proper error handling
- **Resilience** - Circuit breakers and rate limiting
- **Scalability** - Independent service scaling

### Full-Stack Development
- **Backend** - Spring Boot microservices
- **Frontend** - Modern React/Next.js application
- **Integration** - API Gateway and service communication
- **Authentication** - JWT with Clerk integration
- **DevOps** - Docker containerization

### Production Readiness
- **Monitoring** - Health checks and metrics
- **Security** - JWT authentication and CORS
- **Performance** - Caching and optimization
- **Documentation** - Comprehensive guides and diagrams

## 🚀 Next Steps

1. **Service Discovery** - Add Eureka for dynamic discovery
2. **Distributed Tracing** - Implement Zipkin/Jaeger
3. **Event-Driven Architecture** - Add Kafka for async communication
4. **Kubernetes** - Production deployment manifests
5. **CI/CD Pipeline** - Automated testing and deployment
6. **Monitoring** - Prometheus and Grafana dashboards

---

**This documentation covers a production-ready microservices application perfect for showcasing enterprise-level development skills!** 🎉