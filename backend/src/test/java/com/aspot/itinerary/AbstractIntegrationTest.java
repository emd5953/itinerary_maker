package com.aspot.itinerary;

import com.aspot.itinerary.config.TestContainersConfig;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Base class for integration tests that require TestContainers.
 * This class sets up PostgreSQL, Redis, and Elasticsearch containers
 * for testing purposes.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
@Import(TestContainersConfig.class)
public abstract class AbstractIntegrationTest {
    
    // This class provides the base configuration for integration tests
    // Subclasses can extend this to get access to all TestContainers
}