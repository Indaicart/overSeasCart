package com.schoolms.repository;

import com.schoolms.entity.LeaveType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaveTypeRepository extends JpaRepository<LeaveType, UUID>, JpaSpecificationExecutor<LeaveType> {
    
    List<LeaveType> findBySchoolId(UUID schoolId);
    
    Page<LeaveType> findBySchoolId(UUID schoolId, Pageable pageable);
    
    List<LeaveType> findBySchoolIdAndIsActive(UUID schoolId, Boolean isActive);
    
    Page<LeaveType> findBySchoolIdAndIsActive(UUID schoolId, Boolean isActive, Pageable pageable);
    
    Optional<LeaveType> findBySchoolIdAndCode(UUID schoolId, String code);
    
    boolean existsBySchoolIdAndCode(UUID schoolId, String code);
    
    List<LeaveType> findBySchoolIdOrderByDisplayOrder(UUID schoolId);
}

