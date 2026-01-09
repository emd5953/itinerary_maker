package com.aspot.gateway.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    @GetMapping("/forecast")
    public ResponseEntity<Map<String, Object>> getWeatherForecast(
            @RequestParam String destination,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        
        // Return a placeholder response indicating the weather service is not implemented
        Map<String, Object> response = Map.of(
            "error", "Weather service not implemented",
            "message", "Weather forecasting functionality is not yet available",
            "status", 501,
            "destination", destination,
            "startDate", startDate,
            "endDate", endDate
        );
        
        return ResponseEntity.status(501).body(response);
    }
}