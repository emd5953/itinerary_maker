@echo off
REM Development setup script for aSpot Itinerary Planning

echo 🚀 Setting up aSpot development environment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Start development services (databases only)
echo 📦 Starting development services (PostgreSQL, Redis, Elasticsearch)...
docker-compose -f docker-compose.dev.yml up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo 🔍 Checking service health...

REM Check PostgreSQL
docker-compose -f docker-compose.dev.yml exec postgres pg_isready -U aspot_dev -d aspot_dev >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL is ready
) else (
    echo ❌ PostgreSQL is not ready
)

REM Check Redis
docker-compose -f docker-compose.dev.yml exec redis redis-cli ping >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Redis is ready
) else (
    echo ❌ Redis is not ready
)

REM Check Elasticsearch
curl -f http://localhost:9200/_cluster/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Elasticsearch is ready
) else (
    echo ❌ Elasticsearch is not ready
)

echo.
echo 🎉 Development environment is ready!
echo.
echo Services running:
echo   📊 PostgreSQL: localhost:5432
echo   🔄 Redis: localhost:6379
echo   🔍 Elasticsearch: localhost:9200
echo.
echo To start the backend:
echo   cd backend ^&^& mvn spring-boot:run -Dspring-boot.run.profiles=dev
echo.
echo To start the frontend:
echo   npm run dev
echo.
echo To stop services:
echo   docker-compose -f docker-compose.dev.yml down