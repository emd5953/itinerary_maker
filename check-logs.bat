@echo off
echo Checking service logs for errors...
echo.

echo ========================================
echo API Gateway Logs (last 20 lines):
echo ========================================
docker-compose -f docker/docker-compose.microservices.yml logs --tail=20 api-gateway

echo.
echo ========================================
echo User Service Logs (last 20 lines):
echo ========================================
docker-compose -f docker/docker-compose.microservices.yml logs --tail=20 user-service

echo.
echo ========================================
echo Itinerary Service Logs (last 20 lines):
echo ========================================
docker-compose -f docker/docker-compose.microservices.yml logs --tail=20 itinerary-service

echo.
echo ========================================
echo Activity Service Logs (last 20 lines):
echo ========================================
docker-compose -f docker/docker-compose.microservices.yml logs --tail=20 activity-service

echo.
echo ========================================
echo Collaboration Service Logs (last 20 lines):
echo ========================================
docker-compose -f docker/docker-compose.microservices.yml logs --tail=20 collaboration-service

echo.
echo ========================================
echo Frontend Logs (last 20 lines):
echo ========================================
docker-compose -f docker/docker-compose.microservices.yml logs --tail=20 frontend

echo.
echo To follow logs in real-time: docker-compose -f docker/docker-compose.microservices.yml logs -f
pause