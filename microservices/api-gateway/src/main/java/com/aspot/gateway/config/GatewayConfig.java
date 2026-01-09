package com.aspot.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;

@Configuration
public class GatewayConfig {

    @Value("${USER_SERVICE_URL:http://localhost:8081}")
    private String userServiceUrl;
    
    @Value("${ITINERARY_SERVICE_URL:http://localhost:8082}")
    private String itineraryServiceUrl;
    
    @Value("${ACTIVITY_SERVICE_URL:http://localhost:8083}")
    private String activityServiceUrl;
    
    @Value("${COLLABORATION_SERVICE_URL:http://localhost:8084}")
    private String collaborationServiceUrl;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // User Service Routes - no auth for now
                .route("user-service-plural", r -> r.path("/api/users/**")
                        .uri(userServiceUrl))
                .route("user-service-singular", r -> r.path("/api/user/**")
                        .uri(userServiceUrl))
                
                // Itinerary Service Routes - no auth for now
                .route("itinerary-service", r -> r.path("/api/itineraries/**")
                        .uri(itineraryServiceUrl))
                
                // Activity Service Routes - no auth for now
                .route("activity-service", r -> r.path("/api/activities/**")
                        .uri(activityServiceUrl))
                
                // Collaboration Service Routes - no auth for now
                .route("collaboration-service", r -> r.path("/api/collaborations/**", "/api/proposals/**")
                        .uri(collaborationServiceUrl))
                
                // Health endpoints
                .route("health-check", r -> r.path("/api/health")
                        .uri("http://localhost:8080/actuator/health"))
                
                .build();
    }
}