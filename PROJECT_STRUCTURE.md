# aSpot Itinerary Planning - Project Structure

This document outlines the complete project structure for the aSpot travel itinerary planning application.

## Overview

The project is organized as a full-stack application with:
- **Frontend**: Next.js 15 with React 19, TypeScript, and Tailwind CSS
- **Backend**: Spring Boot 3.x with Java 17, PostgreSQL, Redis, and Elasticsearch
- **Infrastructure**: Docker Compose for local development

## Directory Structure

```
itinerary_maker/
├── .kiro/                          # Kiro specifications and configuration
│   └── specs/
│       └── itinerary-planning/
│           ├── requirements.md     # Feature requirements document
│           ├── design.md          # Technical design document
│           └── tasks.md           # Implementation task list
├── backend/                        # Spring Boot backend application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/aspot/itinerary/
│   │   │   │   ├── config/        # Configuration classes
│   │   │   │   ├── controller/    # REST API controllers
│   │   │   │   ├── entity/        # JPA entities
│   │   │   │   ├── repository/    # Data repositories
│   │   │   │   ├── service/       # Business logic services
│   │   │   │   └── ItineraryApplication.java
│   │   │   └── resources/
│   │   │       ├── db/migration/  # Flyway database migrations
│   │   │       ├── application.yml
│   │   │       ├── application-dev.yml
│   │   │       └── application-test.yml
│   │   └── test/
│   │       └── java/com/aspot/itinerary/
│   │           ├── config/        # Test configuration
│   │           ├── AbstractIntegrationTest.java
│   │           ├── AbstractPropertyTest.java
│   │           └── ItineraryApplicationTests.java
│   ├── Dockerfile.dev             # Development Docker image
│   ├── pom.xml                    # Maven configuration
│   ├── README.md                  # Backend documentation
│   └── .gitignore                 # Backend-specific ignores
├── app/                           # Next.js frontend application
│   ├── api/                       # API routes
│   ├── components/                # React components (to be created)
│   ├── lib/                       # Utility libraries (to be created)
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   └── providers.tsx              # Context providers
├── scripts/                       # Development scripts
│   ├── dev-setup.sh              # Linux/Mac development setup
│   └── dev-setup.bat             # Windows development setup
├── docker-compose.yml            # Full-stack Docker Compose
├── docker-compose.dev.yml        # Development services only
├── Dockerfile.dev                # Frontend development Docker image
├── package.json                  # Frontend dependencies
├── PROJECT_STRUCTURE.md          # This file
└── README.md                     # Main project documentation
```

## Backend Architecture

### Core Packages

- **config/**: Spring configuration classes for Redis, Elasticsearch, Security
- **controller/**: REST API endpoints organized by feature
- **entity/**: JPA entities representing the data model
- **repository/**: Data access layer with JPA and Elasticsearch repositories
- **service/**: Business logic and service layer

### Key Technologies

- **Spring Boot 3.x**: Main framework with auto-configuration
- **Spring Data JPA**: Database operations with PostgreSQL
- **Spring Data Redis**: Caching and session management
- **Spring Data Elasticsearch**: Search and recommendations
- **Spring Security**: Authentication and authorization
- **Flyway**: Database migration management
- **TestContainers**: Integration testing with real databases
- **jqwik**: Property-based testing framework

### Database Schema

The application uses PostgreSQL with the following main entities:
- **Users**: User accounts and preferences
- **Itineraries**: Travel plans with dates and destinations
- **Activities**: Master data for attractions and experiences
- **Scheduled Activities**: Activities added to specific itineraries
- **Collaboration**: Sharing, proposals, and voting system

## Frontend Architecture

### Core Structure

- **app/**: Next.js 13+ app router structure
- **components/**: Reusable React components
- **lib/**: Utility functions and API clients
- **redux/**: State management with Redux Toolkit

### Key Technologies

- **Next.js 15**: React framework with app router
- **React 19**: UI library with latest features
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **Redux Toolkit**: State management
- **NextAuth.js**: Authentication integration

## Development Environment

### Prerequisites

- **Java 17+**: Backend development
- **Node.js 18+**: Frontend development
- **Docker**: Local services (PostgreSQL, Redis, Elasticsearch)
- **Maven**: Backend dependency management
- **npm/yarn**: Frontend dependency management

### Quick Start

1. **Start Infrastructure Services**:
   ```bash
   # Linux/Mac
   ./scripts/dev-setup.sh
   
   # Windows
   scripts\dev-setup.bat
   
   # Or manually
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Start Backend**:
   ```bash
   cd backend
   mvn spring-boot:run -Dspring-boot.run.profiles=dev
   ```

3. **Start Frontend**:
   ```bash
   npm run dev
   ```

### Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Elasticsearch**: localhost:9200

## Testing Strategy

### Backend Testing

- **Unit Tests**: Individual component testing
- **Integration Tests**: Full application context with TestContainers
- **Property-Based Tests**: Universal property validation with jqwik
- **API Tests**: REST endpoint testing

### Frontend Testing

- **Component Tests**: React component testing
- **Integration Tests**: User workflow testing
- **Property-Based Tests**: UI consistency with fast-check

## Deployment

### Development

- Docker Compose for local development
- Hot reloading for both frontend and backend
- Real database instances via TestContainers

### Production (Future)

- Kubernetes deployment
- Separate database instances (AWS RDS, ElastiCache, OpenSearch)
- CI/CD pipeline with automated testing
- Monitoring and observability stack

## Next Steps

This project structure provides the foundation for implementing the aSpot itinerary planning application. The next tasks involve:

1. Implementing core data models and JPA entities
2. Creating REST API endpoints
3. Building React components and UI
4. Adding authentication and security
5. Implementing recommendation engine
6. Adding collaboration features

Refer to `.kiro/specs/itinerary-planning/tasks.md` for the detailed implementation plan.