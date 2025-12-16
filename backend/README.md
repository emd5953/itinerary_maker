# aSpot Itinerary Backend

Spring Boot backend service for the aSpot travel itinerary planning application.

## Technology Stack

- **Java 17** with Spring Boot 3.x
- **PostgreSQL** for primary data storage
- **Redis** for caching and session management
- **Elasticsearch** for activity search and recommendations
- **Maven** for dependency management
- **TestContainers** for integration testing
- **jqwik** for property-based testing

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- Docker and Docker Compose
- Git

## Quick Start

### 1. Start Development Services

Run the development setup script to start PostgreSQL, Redis, and Elasticsearch:

```bash
# On Linux/Mac
./scripts/dev-setup.sh

# On Windows
scripts\dev-setup.bat
```

Or manually with Docker Compose:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Run the Application

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

The application will start on `http://localhost:8080`

### 3. Run Tests

```bash
# Run all tests (includes TestContainers integration tests)
mvn test

# Run only unit tests
mvn test -Dtest="*Test"

# Run only integration tests
mvn test -Dtest="*IT"

# Run property-based tests
mvn test -Dtest="*PropertyTest"
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `aspot_dev` |
| `DB_USERNAME` | Database username | `aspot_dev` |
| `DB_PASSWORD` | Database password | `aspot_dev` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `ELASTICSEARCH_URIS` | Elasticsearch URLs | `http://localhost:9200` |
| `JWT_SECRET` | JWT signing secret | `mySecretKey` |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | - |
| `GOOGLE_PLACES_API_KEY` | Google Places API key | - |

### Profiles

- `dev` - Development profile with debug logging
- `test` - Test profile for automated testing
- `prod` - Production profile (to be configured)

## Database

### Migrations

Database migrations are managed by Flyway and located in `src/main/resources/db/migration/`.

To run migrations manually:

```bash
mvn flyway:migrate
```

### Schema

The application uses the following main entities:
- Users and user preferences
- Itineraries and day plans
- Activities (master data) and scheduled activities
- Collaboration sessions, proposals, and votes

## Testing

### Integration Tests

Integration tests use TestContainers to spin up real PostgreSQL, Redis, and Elasticsearch instances. Tests extend `AbstractIntegrationTest`.

### Property-Based Tests

Property-based tests use jqwik and extend `AbstractPropertyTest`. Each property test runs 100 iterations by default and validates universal properties across random inputs.

### Test Containers

TestContainers configuration is in `TestContainersConfig.java`. Containers are reused across test runs for performance.

## API Documentation

Once the application is running, API documentation is available at:
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Monitoring

Health checks and metrics are available at:
- Health: `http://localhost:8080/actuator/health`
- Metrics: `http://localhost:8080/actuator/metrics`
- Prometheus: `http://localhost:8080/actuator/prometheus`

## Development

### Code Style

The project uses:
- Lombok for reducing boilerplate code
- MapStruct for entity-DTO mapping
- Spring Boot conventions for configuration

### Adding New Features

1. Create JPA entities in `com.aspot.itinerary.entity`
2. Create repositories in `com.aspot.itinerary.repository`
3. Create services in `com.aspot.itinerary.service`
4. Create controllers in `com.aspot.itinerary.controller`
5. Add integration tests extending `AbstractIntegrationTest`
6. Add property-based tests extending `AbstractPropertyTest`

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 5432, 6379, and 9200 are available
2. **Docker issues**: Restart Docker and run `docker system prune` if needed
3. **Database connection**: Check that PostgreSQL container is healthy
4. **Test failures**: Ensure TestContainers can access Docker daemon

### Logs

Application logs are configured in `application.yml`. For debugging:

```bash
# Enable debug logging
mvn spring-boot:run -Dspring-boot.run.profiles=dev -Dlogging.level.com.aspot.itinerary=DEBUG
```