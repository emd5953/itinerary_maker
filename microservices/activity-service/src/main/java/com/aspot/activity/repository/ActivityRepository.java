package com.aspot.activity.repository;

import com.aspot.activity.model.Activity;
import com.aspot.activity.model.ActivityCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends ElasticsearchRepository<Activity, String> {
    
    List<Activity> findByDestinationIgnoreCase(String destination);
    
    List<Activity> findByDestinationIgnoreCaseAndCategory(String destination, ActivityCategory category);
    
    @Query("{\"bool\": {\"must\": [{\"match\": {\"destination\": \"?0\"}}, {\"range\": {\"rating\": {\"gte\": ?1}}}]}}")
    List<Activity> findByDestinationAndRatingGreaterThanEqual(String destination, Double minRating);
    
    @Query("{\"bool\": {\"must\": [{\"multi_match\": {\"query\": \"?0\", \"fields\": [\"name^2\", \"description\", \"tags\"]}}]}}")
    Page<Activity> searchByQuery(String query, Pageable pageable);
    
    @Query("{\"bool\": {\"must\": [{\"match\": {\"destination\": \"?0\"}}, {\"multi_match\": {\"query\": \"?1\", \"fields\": [\"name^2\", \"description\", \"tags\"]}}]}}")
    List<Activity> searchByDestinationAndQuery(String destination, String query);
    
    List<Activity> findByIsPopularTrueAndDestinationIgnoreCase(String destination);
}