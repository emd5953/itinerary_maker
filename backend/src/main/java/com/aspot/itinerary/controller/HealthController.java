package com.aspot.itinerary.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
public class HealthController {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", System.currentTimeMillis());
        
        // Check database connection
        try (Connection connection = dataSource.getConnection()) {
            health.put("database", "UP");
        } catch (Exception e) {
            health.put("database", "DOWN - " + e.getMessage());
        }
        
        // Check Redis connection
        try {
            redisTemplate.opsForValue().set("health-check", "test");
            String value = (String) redisTemplate.opsForValue().get("health-check");
            health.put("redis", "test".equals(value) ? "UP" : "DOWN");
            redisTemplate.delete("health-check");
        } catch (Exception e) {
            health.put("redis", "DOWN - " + e.getMessage());
        }
        
        return ResponseEntity.ok(health);
    }
}