package com.aspot.itinerary.model.activity;

import com.aspot.itinerary.model.enums.ActivityCategory;
import com.aspot.itinerary.model.valueobject.Location;
import com.aspot.itinerary.model.valueobject.OpeningHours;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    private ActivityCategory category;
    
    @Embedded
    private Location location;
    
    @Column(nullable = false)
    private String destination;
    
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "activity_tags", joinColumns = @JoinColumn(name = "activity_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();
    
    private Double rating;
    
    @Column(name = "review_count")
    private Integer reviewCount;
    
    @Column(name = "price_range")
    private String priceRange;
    
    @Embedded
    private OpeningHours openingHours;
    
    @Column(name = "website_url")
    private String websiteUrl;
    
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "activity_images", joinColumns = @JoinColumn(name = "activity_id"))
    @Column(name = "image_url")
    private List<String> imageUrls = new ArrayList<>();
    
    @Column(name = "is_popular", nullable = false)
    private Boolean isPopular = false;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Elasticsearch indexing
    @Transient
    private Float searchScore;
}