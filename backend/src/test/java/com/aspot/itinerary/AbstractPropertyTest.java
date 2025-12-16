package com.aspot.itinerary;

import com.aspot.itinerary.config.TestContainersConfig;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Base class for property-based tests using jqwik with TestContainers.
 * This class provides the foundation for property-based testing with
 * real database and cache instances.
 * 
 * Note: Property-based tests extending this class should use @Property
 * annotation from jqwik and can access Spring beans through @Autowired.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
@Import(TestContainersConfig.class)
public abstract class AbstractPropertyTest {
    
    static {
        // Enable TestContainers reuse for faster test execution
        System.setProperty("testcontainers.reuse.enable", "true");
    }
}