@echo off
echo Restarting aSpot with Core Feature Fixes...
echo.

echo Stopping existing containers...
docker-compose -f docker/docker-compose.microservices.yml down

echo.
echo Rebuilding services with new code...
docker-compose -f docker/docker-compose.microservices.yml build --no-cache

echo.
echo Starting all services...
docker-compose -f docker/docker-compose.microservices.yml up -d

echo.
echo Waiting for services to initialize (60 seconds)...
timeout /t 60 /nobreak >nul

echo.
echo ========================================
echo CORE FIXES APPLIED:
echo ========================================
echo ✓ User Service: Added User and UserPreferences entities
echo ✓ User Service: Added proper database schema with Flyway migration
echo ✓ User Service: Added demo user with ID: 550e8400-e29b-41d4-a716-446655440000
echo ✓ User Service: Fixed endpoints to match service client calls
echo ✓ Activity Service: Added error handling for Elasticsearch failures
echo ✓ Activity Service: Fallback to Google Places API when Elasticsearch is empty
echo ✓ Configuration: Fixed Elasticsearch environment variable usage
echo ✓ Configuration: Fixed frontend API URL for Docker environment
echo.

echo ========================================
echo TESTING CORE FEATURES:
echo ========================================
echo.

echo Testing User Service...
curl -s "http://localhost:8081/actuator/health" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ User Service is healthy
) else (
    echo ✗ User Service is not responding
)

echo Testing Activity Service...
curl -s "http://localhost:8083/actuator/health" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Activity Service is healthy
) else (
    echo ✗ Activity Service is not responding
)

echo Testing Itinerary Service...
curl -s "http://localhost:8082/actuator/health" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Itinerary Service is healthy
) else (
    echo ✗ Itinerary Service is not responding
)

echo Testing API Gateway...
curl -s "http://localhost:8080/actuator/health" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ API Gateway is healthy
) else (
    echo ✗ API Gateway is not responding
)

echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo 1. Run: test-features.bat (to test core functionality)
echo 2. Open: http://localhost:3000 (frontend)
echo 3. Check logs: check-logs.bat (if issues)
echo.
echo Demo User ID for testing: 550e8400-e29b-41d4-a716-446655440000
echo.
pause