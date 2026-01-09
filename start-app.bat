@echo off
echo Starting aSpot Application...
echo.

echo Checking if Docker is running...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running or not installed!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo Docker is running. Starting application...
echo.

echo Stopping any existing containers...
docker-compose -f docker/docker-compose.microservices.yml down

echo.
echo Starting all services (this may take a few minutes)...
docker-compose -f docker/docker-compose.microservices.yml up -d

echo.
echo Waiting for services to start...
timeout /t 30 /nobreak >nul

echo.
echo Checking service health...
echo.

echo API Gateway: http://localhost:8080
curl -s http://localhost:8080/actuator/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ API Gateway is healthy
) else (
    echo ✗ API Gateway is not responding
)

echo User Service: http://localhost:8081
curl -s http://localhost:8081/actuator/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ User Service is healthy
) else (
    echo ✗ User Service is not responding
)

echo Itinerary Service: http://localhost:8082
curl -s http://localhost:8082/actuator/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Itinerary Service is healthy
) else (
    echo ✗ Itinerary Service is not responding
)

echo Activity Service: http://localhost:8083
curl -s http://localhost:8083/actuator/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Activity Service is healthy
) else (
    echo ✗ Activity Service is not responding
)

echo Collaboration Service: http://localhost:8084
curl -s http://localhost:8084/actuator/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Collaboration Service is healthy
) else (
    echo ✗ Collaboration Service is not responding
)

echo.
echo Frontend: http://localhost:3000
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Frontend is running
) else (
    echo ✗ Frontend is not responding
)

echo.
echo ========================================
echo Application Status:
echo ========================================
echo Frontend:     http://localhost:3000
echo API Gateway:  http://localhost:8080
echo.
echo To view logs: docker-compose -f docker/docker-compose.microservices.yml logs -f
echo To stop app:  docker-compose -f docker/docker-compose.microservices.yml down
echo.
pause