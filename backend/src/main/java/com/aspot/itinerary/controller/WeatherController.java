package com.aspot.itinerary.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/weather")
@RequiredArgsConstructor
@Slf4j
public class WeatherController {
    
    @Value("${OPENWEATHER_API_KEY}")
    private String apiKey;
    
    private final WebClient webClient = WebClient.builder().build();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Simple test endpoint to verify weather controller is working
     */
    @GetMapping("/test")
    public ResponseEntity<String> testWeatherEndpoint() {
        log.info("=== WEATHER TEST ENDPOINT CALLED ===");
        return ResponseEntity.ok("Weather controller is working! API Key configured: " + (apiKey != null && !apiKey.isEmpty()));
    }
    
    /**
     * Get weather forecast for a destination and date range
     */
    @GetMapping("/forecast")
    public ResponseEntity<List<WeatherForecast>> getWeatherForecast(
            @RequestParam String destination,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        
        log.info("=== WEATHER API CALLED === Fetching weather forecast for {} from {} to {}", destination, startDate, endDate);
        log.info("API Key configured: {}", apiKey != null && !apiKey.isEmpty() ? "YES" : "NO");
        
        try {
            // Get 5-day forecast from OpenWeatherMap
            String url = String.format(
                "https://api.openweathermap.org/data/2.5/forecast?q=%s&appid=%s&units=imperial",
                destination, apiKey
            );
            
            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            
            JsonNode weatherData = objectMapper.readTree(response);
            List<WeatherForecast> forecasts = parseWeatherResponse(weatherData, startDate, endDate);
            
            log.info("Successfully fetched {} weather forecasts for {}", forecasts.size(), destination);
            return ResponseEntity.ok(forecasts);
            
        } catch (Exception e) {
            log.error("Error fetching weather forecast for {}: {}", destination, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    private List<WeatherForecast> parseWeatherResponse(JsonNode weatherData, String startDate, String endDate) {
        List<WeatherForecast> forecasts = new ArrayList<>();
        
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            
            JsonNode forecastList = weatherData.get("list");
            
            // Group forecasts by date and get daily summaries
            LocalDate currentDate = start;
            while (!currentDate.isAfter(end)) {
                WeatherForecast dailyForecast = getDailyForecast(forecastList, currentDate);
                if (dailyForecast != null) {
                    forecasts.add(dailyForecast);
                }
                currentDate = currentDate.plusDays(1);
            }
            
        } catch (Exception e) {
            log.error("Error parsing weather response: {}", e.getMessage());
        }
        
        return forecasts;
    }
    
    private WeatherForecast getDailyForecast(JsonNode forecastList, LocalDate date) {
        String targetDate = date.toString();
        
        double maxTemp = Double.MIN_VALUE;
        double minTemp = Double.MAX_VALUE;
        String condition = "clear";
        String description = "Clear skies";
        int humidity = 50;
        double windSpeed = 0;
        String icon = "01d";
        
        boolean foundData = false;
        
        // Look through all forecast entries for this date
        for (JsonNode forecast : forecastList) {
            String forecastDateTime = forecast.get("dt_txt").asText();
            if (forecastDateTime.startsWith(targetDate)) {
                foundData = true;
                
                JsonNode main = forecast.get("main");
                JsonNode weather = forecast.get("weather").get(0);
                JsonNode wind = forecast.get("wind");
                
                double temp = main.get("temp").asDouble();
                maxTemp = Math.max(maxTemp, temp);
                minTemp = Math.min(minTemp, temp);
                
                // Use midday forecast for main conditions (around 12:00)
                if (forecastDateTime.contains("12:00:00")) {
                    condition = weather.get("main").asText().toLowerCase();
                    description = weather.get("description").asText();
                    humidity = main.get("humidity").asInt();
                    windSpeed = wind.get("speed").asDouble();
                    icon = weather.get("icon").asText();
                }
            }
        }
        
        if (!foundData) {
            return null;
        }
        
        return WeatherForecast.builder()
                .date(targetDate)
                .condition(condition)
                .description(capitalizeFirst(description))
                .temperature(new Temperature((int) Math.round(maxTemp), (int) Math.round(minTemp)))
                .humidity(humidity)
                .windSpeed((int) Math.round(windSpeed))
                .icon(icon)
                .build();
    }
    
    private String capitalizeFirst(String text) {
        if (text == null || text.isEmpty()) {
            return text;
        }
        return text.substring(0, 1).toUpperCase() + text.substring(1);
    }
    
    /**
     * Weather forecast data structure
     */
    public static class WeatherForecast {
        public String date;
        public String condition;
        public String description;
        public Temperature temperature;
        public int humidity;
        public int windSpeed;
        public String icon;
        
        public static WeatherForecastBuilder builder() {
            return new WeatherForecastBuilder();
        }
        
        public static class WeatherForecastBuilder {
            private WeatherForecast forecast = new WeatherForecast();
            
            public WeatherForecastBuilder date(String date) {
                forecast.date = date;
                return this;
            }
            
            public WeatherForecastBuilder condition(String condition) {
                forecast.condition = condition;
                return this;
            }
            
            public WeatherForecastBuilder description(String description) {
                forecast.description = description;
                return this;
            }
            
            public WeatherForecastBuilder temperature(Temperature temperature) {
                forecast.temperature = temperature;
                return this;
            }
            
            public WeatherForecastBuilder humidity(int humidity) {
                forecast.humidity = humidity;
                return this;
            }
            
            public WeatherForecastBuilder windSpeed(int windSpeed) {
                forecast.windSpeed = windSpeed;
                return this;
            }
            
            public WeatherForecastBuilder icon(String icon) {
                forecast.icon = icon;
                return this;
            }
            
            public WeatherForecast build() {
                return forecast;
            }
        }
    }
    
    /**
     * Temperature data structure
     */
    public static class Temperature {
        public int max;
        public int min;
        
        public Temperature(int max, int min) {
            this.max = max;
            this.min = min;
        }
    }
}