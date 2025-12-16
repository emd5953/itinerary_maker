# aSpot - Travel Itinerary Planning Application

## Overview

aSpot is a comprehensive travel itinerary planning application that helps users create, organize, and collaborate on travel plans. The system addresses the common problem of poorly planned trips by providing intelligent recommendations, scheduling tools, and collaborative features.

## Features

- **Smart Itinerary Creation**: Generate structured travel plans with AI-powered recommendations
- **Collaborative Planning**: Share and edit itineraries with travel companions
- **Activity Recommendations**: Discover attractions based on preferences and interests
- **Map Integration**: Visualize routes and optimize travel logistics
- **Schedule Management**: Organize activities by day and time with conflict detection
- **Export Options**: Export to PDF and calendar applications

## Architecture

- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **Backend**: Java 17 with Spring Boot 3.x, PostgreSQL, Redis, Elasticsearch
- **Infrastructure**: Docker, Kubernetes (production)

## Quick Start

### Prerequisites
- Node.js 18+
- Java 17+
- Docker & Docker Compose

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd itinerary_maker
   ```

2. **Start infrastructure services**
   ```bash
   docker-compose -f docker/docker-compose.dev.yml up -d
   ```

3. **Start backend**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

4. **Start frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - API Health: http://localhost:8080/health

## Project Structure

```
├── docs/                   # Documentation
├── frontend/              # Next.js frontend application
├── backend/               # Spring Boot backend application
├── docker/                # Docker configuration files
├── config/                # Configuration files
├── .kiro/                 # Kiro IDE specifications
└── scripts/               # Development scripts
```

## Development

See individual README files in each directory:
- [Frontend Documentation](../frontend/README.md)
- [Backend Documentation](../backend/README.md)
- [Docker Setup](../docker/README.md)

## Contributing

1. Follow the spec-driven development process in `.kiro/specs/`
2. Use the task-based implementation approach
3. Ensure all tests pass before submitting PRs
4. Follow the established code organization patterns

## License

[Add your license here]