package com.aspot.itinerary.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

@Configuration
@EnableElasticsearchRepositories(basePackages = "com.aspot.itinerary.repository.elasticsearch")
public class ElasticsearchConfig {
    // Configuration is handled by Spring Boot auto-configuration
    // This class enables Elasticsearch repositories and sets the base package
}