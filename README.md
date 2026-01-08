# aSpot - Travel Itinerary Planning Application

> *"yo chat- I know a spot"* 

## Overview

aSpot is a comprehensive travel itinerary planning application that helps users create, organize, and collaborate on travel plans. The system addresses the common problem of poorly planned trips by providing intelligent recommendations, scheduling tools, and collaborative features.

##  Features

- **Smart Itinerary Creation** - AI-powered activity recommendations
- **Collaborative Planning** - Share and edit itineraries with travel companions
- **Activity Recommendations** - Discover attractions based on preferences and interests
- **GPS Map Integration** - Real-time location tracking and interactive maps
- **Route Optimization** - Multi-stop route planning with turn-by-turn navigation
- **Schedule Management** - Organize activities by day and time with conflict detection
- **Export Options** - Export to PDF and calendar applications

##  Architecture

### Microservices Architecture
- **API Gateway**: Spring Cloud Gateway (Port 8080) - Routing, circuit breakers, rate limiting
- **User Service**: Spring Boot (Port 8081) - User management & authentication
- **Itinerary Service**: Spring Boot (Port 8082) - Itinerary & day plan management
- **Activity Service**: Spring Boot (Port 8083) - Activity search & recommendations
- **Collaboration Service**: Spring Boot (Port 8084) - Real-time collaboration

### Frontend
- **Next.js 15** with React 19, TypeScript, Tailwind CSS

### Databases (Database-per-Service Pattern)
- **PostgreSQL** (3 instances) - User, Itinerary, Collaboration databases
- **Elasticsearch** - Activity search and recommendations
- **Redis** - Caching and rate limiting

### Infrastructure
- **Docker Compose** - Local development and testing
- **Kubernetes** - Production deployment (ready)

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- Java 17+
- Docker & Docker Compose

### Development Setup

#### Option 1: Microservices Architecture (Recommended)

```bash
# Start all microservices with Docker Compose
docker-compose -f docker/docker-compose.microservices.yml up -d

# Access the application
# Frontend: http://localhost:3000
# API Gateway: http://localhost:8080
# Individual services: 8081-8084
```


## 📁 Project Structure

```
├── docs/                   # Documentation
├── microservices/         # Microservices architecture
│   ├── api-gateway/       # API Gateway (Spring Cloud Gateway)
│   ├── user-service/      # User management service
│   ├── itinerary-service/ # Itinerary management service
│   ├── activity-service/  # Activity search service
│   └── collaboration-service/ # Collaboration service
├── frontend/              # Next.js frontend application
├── docker/                # Docker configuration files
├── config/                # Configuration files
└── .kiro/                 # Kiro IDE specifications
```

##  Documentation

### Microservices
- **[Microservices Summary](./MICROSERVICES_SUMMARY.md)** - Quick overview
- **[Microservices Setup Guide](./docs/MICROSERVICES_SETUP.md)** - Detailed setup
- **[Microservices Architecture](./docs/MICROSERVICES_ARCHITECTURE.md)** - Architecture details

### Components
- [Frontend Documentation](./frontend/README.md)
- [GPS Setup Guide](./docs/GPS_SETUP.md) - Configure Google Maps integration
- [Docker Setup](./docker/README.md)
- [Complete Documentation](./docs/README.md)

