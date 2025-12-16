package com.aspot.itinerary.repository.activity;

import com.aspot.itinerary.model.activity.Activity;
import com.aspot.itinerary.model.enums.ActivityCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, UUID> {
    List<Activity> findByDestinationIgnoreCase(String destination);
    List<Activity> findByCategory(ActivityCategory category);
    List<Activity> findByIsPopularTrue();
    
    @Query("SELECT a FROM Activity a WHERE a.destination = :destination AND a.category = :category")
    List<Activity> findByDestinationAndCategory(@Param("destination") String destination, 
                                               @Param("category") ActivityCategory category);
}