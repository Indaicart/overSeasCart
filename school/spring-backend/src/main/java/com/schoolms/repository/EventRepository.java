package com.schoolms.repository;

import com.schoolms.entity.Event;
import com.schoolms.enums.EventType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID>, JpaSpecificationExecutor<Event> {
    
    List<Event> findBySchoolId(UUID schoolId);
    
    Page<Event> findBySchoolId(UUID schoolId, Pageable pageable);
    
    List<Event> findBySchoolIdAndEventType(UUID schoolId, EventType eventType);
    
    List<Event> findBySchoolIdAndIsPublished(UUID schoolId, Boolean isPublished);
    
    Page<Event> findBySchoolIdAndIsPublished(UUID schoolId, Boolean isPublished, Pageable pageable);
    
    List<Event> findBySchoolIdAndEventDateBetween(UUID schoolId, LocalDate startDate, LocalDate endDate);
    
    List<Event> findBySchoolIdAndEventDateAfter(UUID schoolId, LocalDate date);
    
    List<Event> findBySchoolIdOrderByEventDateDesc(UUID schoolId);
}

