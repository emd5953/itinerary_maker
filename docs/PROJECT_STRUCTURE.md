# aSpot Project Structure

## Overview

This document describes the complete project structure for the aSpot travel itinerary planning application. The project follows a clean, organized structure with clear separation of concerns.

## 📁 Root Directory Structure

```
aspot/
├── 📁 .git/                    # Git version control
├── 📁 .kiro/                   # Kiro IDE specifications
│   └── specs/                  # Feature specifications
├── 📁 .vscode/                 # VS Code configuration
├── 📁 backend/                 # Java Spring Boot backend
├── 📁 config/                  # Configuration files
├── 📁 docker/                  # Docker configuration
├── 📁 docs/                    # Documentation
├── 📁 frontend/                # Next.js frontend
├── 📁 scripts/                 # Development scripts
├── .env.local                  # Environment variables
├── .gitignore                  # Git ignore rules
└── README.md                   # Main project README
```

## 📁 Detailed Directory Breakdown

### `.kiro/` - Kiro IDE Specifications
```
.kiro/
└── specs/
    └── itinerary-planning/
        ├── requirements.md     # Functional requirements
        ├── design.md          # Technical design
        └── tasks.md           # Implementation tasks
```

### `backend/` - Spring Boot Backend
```
backend/
├── src/
│   ├── main/java/com/aspot/itinerary/
│   │   ├── model/             # Domain entities
│   │   │   ├── user/          # User domain
│   │   │   ├── itinerary/     # Itinerary domain
│   │   │   ├── activity/      # Activity domain
│   │   │   ├── collaboration/ # Collaboration domain
│   │   │   ├── enums/         # Enumerations
│   │   │   └── valueobject/   # Value objects
│   │   ├── repository/        # Data access layer
│   │   │   ├── user/
│   │   │   ├── itinerary/
│   │   │   ├── activity/
│   │   │   └── collaboration/
│   │   ├── service/           # Business logic layer
│   │   │   ├── user/
│   │   │   ├── itinerary/
│   │   │   ├── activity/
│   │   │   └── collaboration/
│   │   ├── controller/        # REST API controllers
│   │   ├── config/            # Configuration classes
│   │   └── ItineraryApplication.java
│   ├── main/resources/
│   │   ├── db/migration/      # Flyway migrations
│   │   └── application*.yml   # Configuration files
│   └── test/                  # Test classes
├── target/                    # Maven build output
├── pom.xml                    # Maven configuration
├── README.md                  # Backend documentation
└── BACKEND_STRUCTURE.md       # Backend structure guide
```

### `frontend/` - Next.js Frontend
```
frontend/
├── app/                       # Next.js App Router
│   ├── api/                   # API routes
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/                # React components (to be added)
├── redux/                     # Redux state management
│   ├── slices/                # Redux slices
│   └── store.ts               # Store configuration
├── public/                    # Static assets
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies
└── README.md                  # Frontend documentation
```

### `docker/` - Docker Configuration
```
docker/
├── docker-compose.dev.yml     # Development services
├── docker-compose.yml         # Production services
├── Dockerfile.frontend        # Frontend Docker image
└── README.md                  # Docker documentation
```

### `config/` - Configuration Files
```
config/
├── eslint.config.mjs          # ESLint configuration
├── next.config.ts             # Next.js configuration
├── postcss.config.mjs         # PostCSS configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

### `docs/` - Documentation
```
docs/
├── README.md                  # Complete project documentation
├── PROJECT_STRUCTURE.md       # This file
└── [other documentation]      # Additional docs as needed
```

### `scripts/` - Development Scripts
```
scripts/
├── dev-setup.sh               # Unix development setup
└── dev-setup.bat              # Windows development setup
```

## 🎯 Benefits of This Organization

### 1. **Clear Separation of Concerns**
- Frontend and backend are completely separated
- Configuration files are centralized
- Docker files are organized together
- Documentation is in one place

### 2. **Scalability**
- Easy to add new features within existing domains
- Clear structure for team collaboration
- Modular architecture supports growth

### 3. **Developer Experience**
- Easy to find files and understand project structure
- Consistent organization patterns
- Clear documentation for each component

### 4. **Deployment Ready**
- Docker configurations are organized and ready
- Environment-specific configurations are separated
- Production and development setups are clear

## 🚀 Getting Started

### Quick Start Commands

```bash
# Start infrastructure services
docker-compose -f docker/docker-compose.dev.yml up -d

# Start backend (from backend directory)
cd backend && ./mvnw spring-boot:run

# Start frontend (from frontend directory)
cd frontend && npm install && npm run dev
```

### Development Workflow

1. **Specifications**: Start with `.kiro/specs/` for requirements and design
2. **Backend Development**: Work in `backend/` following the domain structure
3. **Frontend Development**: Work in `frontend/` with Next.js App Router
4. **Configuration**: Modify files in `config/` as needed
5. **Documentation**: Update files in `docs/` as the project evolves

## 📚 Additional Resources

- [Backend Structure Guide](../backend/BACKEND_STRUCTURE.md)
- [Frontend Documentation](../frontend/README.md)
- [Docker Setup Guide](../docker/README.md)
- [Requirements Specification](../.kiro/specs/itinerary-planning/requirements.md)
- [Design Document](../.kiro/specs/itinerary-planning/design.md)
- [Implementation Tasks](../.kiro/specs/itinerary-planning/tasks.md)

## 🔄 Maintenance

This structure should be maintained as the project grows:

1. **New Features**: Follow the domain-driven structure
2. **Documentation**: Keep docs updated with changes
3. **Configuration**: Centralize new config files in `config/`
4. **Scripts**: Add new development scripts to `scripts/`

This organization provides a solid foundation for the aSpot application and supports both current development needs and future growth.