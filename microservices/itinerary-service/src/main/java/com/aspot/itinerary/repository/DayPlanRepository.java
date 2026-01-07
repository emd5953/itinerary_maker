package com.aspot.itinerary.repository;

import com.aspot.itinerary.model.DayPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface DayPlanRepository extends JpaRepository<DayPlan, UUID> {
    
    List<DayPlan> findByItineraryIdOrderByDateAsc(UUID itineraryId);
    
    DayPlan findByItineraryIdAndDate(UUID itineraryId, LocalDate date);
}