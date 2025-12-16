#!/bin/bash

# Development setup script for aSpot Itinerary Planning

set -e

echo "🚀 Setting up aSpot development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start development services (databases only)
echo "📦 Starting development services (PostgreSQL, Redis, Elasticsearch)..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check PostgreSQL
if docker-compose -f docker-compose.dev.yml exec postgres pg_isready -U aspot_dev -d aspot_dev > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready"
else
    echo "❌ PostgreSQL is not ready"
fi

# Check Redis
if docker-compose -f docker-compose.dev.yml exec redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis is not ready"
fi

# Check Elasticsearch
if curl -f http://localhost:9200/_cluster/health > /dev/null 2>&1; then
    echo "✅ Elasticsearch is ready"
else
    echo "❌ Elasticsearch is not ready"
fi

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "Services running:"
echo "  📊 PostgreSQL: localhost:5432"
echo "  🔄 Redis: localhost:6379"
echo "  🔍 Elasticsearch: localhost:9200"
echo ""
echo "To start the backend:"
echo "  cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev"
echo ""
echo "To start the frontend:"
echo "  npm run dev"
echo ""
echo "To stop services:"
echo "  docker-compose -f docker-compose.dev.yml down"