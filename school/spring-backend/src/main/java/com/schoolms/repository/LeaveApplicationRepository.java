package com.schoolms.repository;

import com.schoolms.entity.LeaveApplication;
import com.schoolms.enums.LeaveApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaveApplicationRepository extends JpaRepository<LeaveApplication, UUID>, JpaSpecificationExecutor<LeaveApplication> {
    
    List<LeaveApplication> findBySchoolId(UUID schoolId);
    
    Page<LeaveApplication> findBySchoolId(UUID schoolId, Pageable pageable);
    
    List<LeaveApplication> findByTeacherId(UUID teacherId);
    
    Page<LeaveApplication> findByTeacherId(UUID teacherId, Pageable pageable);
    
    List<LeaveApplication> findByTeacherIdAndStatus(UUID teacherId, LeaveApplicationStatus status);
    
    List<LeaveApplication> findBySchoolIdAndStatus(UUID schoolId, LeaveApplicationStatus status);
    
    Page<LeaveApplication> findBySchoolIdAndStatus(UUID schoolId, LeaveApplicationStatus status, Pageable pageable);
    
    Optional<LeaveApplication> findByApplicationNumber(String applicationNumber);
    
    @Query("SELECT la FROM LeaveApplication la WHERE la.teacherId = :teacherId AND " +
           "((la.startDate <= :endDate AND la.endDate >= :startDate)) AND la.status IN ('PENDING', 'APPROVED')")
    List<LeaveApplication> findOverlappingLeaves(
        @Param("teacherId") UUID teacherId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    List<LeaveApplication> findByTeacherIdAndStartDateBetween(UUID teacherId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT la FROM LeaveApplication la WHERE la.schoolId = :schoolId AND " +
           "la.startDate <= :date AND la.endDate >= :date AND la.status = 'APPROVED'")
    List<LeaveApplication> findActiveLeavesBySchoolAndDate(@Param("schoolId") UUID schoolId, @Param("date") LocalDate date);
}

