package com.schoolms.repository;

import com.schoolms.entity.StaffSalary;
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
public interface StaffSalaryRepository extends JpaRepository<StaffSalary, UUID>, JpaSpecificationExecutor<StaffSalary> {
    
    List<StaffSalary> findBySchoolId(UUID schoolId);
    
    Page<StaffSalary> findBySchoolId(UUID schoolId, Pageable pageable);
    
    List<StaffSalary> findByTeacherId(UUID teacherId);
    
    List<StaffSalary> findByTeacherIdAndIsActive(UUID teacherId, Boolean isActive);
    
    Optional<StaffSalary> findByTeacherIdAndIsActiveTrue(UUID teacherId);
    
    List<StaffSalary> findBySchoolIdAndIsActive(UUID schoolId, Boolean isActive);
    
    Page<StaffSalary> findBySchoolIdAndIsActive(UUID schoolId, Boolean isActive, Pageable pageable);
    
    @Query("SELECT s FROM StaffSalary s WHERE s.teacherId = :teacherId AND s.effectiveFrom <= :date AND (s.effectiveTo IS NULL OR s.effectiveTo >= :date)")
    Optional<StaffSalary> findActiveByTeacherAndDate(@Param("teacherId") UUID teacherId, @Param("date") LocalDate date);
    
    boolean existsByTeacherIdAndEffectiveFrom(UUID teacherId, LocalDate effectiveFrom);
}

