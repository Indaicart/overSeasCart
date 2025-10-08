package com.schoolms.repository;

import com.schoolms.entity.ActivityLog;
import com.schoolms.enums.LogAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, UUID>, JpaSpecificationExecutor<ActivityLog> {
    
    List<ActivityLog> findBySchoolId(UUID schoolId);
    
    Page<ActivityLog> findBySchoolId(UUID schoolId, Pageable pageable);
    
    List<ActivityLog> findByUserId(UUID userId);
    
    Page<ActivityLog> findByUserId(UUID userId, Pageable pageable);
    
    List<ActivityLog> findByAction(LogAction action);
    
    List<ActivityLog> findBySchoolIdAndAction(UUID schoolId, LogAction action);
    
    List<ActivityLog> findByEntityTypeAndEntityId(String entityType, UUID entityId);
    
    List<ActivityLog> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    Page<ActivityLog> findBySchoolIdAndCreatedAtBetween(UUID schoolId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
}

