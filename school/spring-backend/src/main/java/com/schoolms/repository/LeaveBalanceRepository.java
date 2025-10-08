package com.schoolms.repository;

import com.schoolms.entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, UUID>, JpaSpecificationExecutor<LeaveBalance> {
    
    List<LeaveBalance> findBySchoolId(UUID schoolId);
    
    List<LeaveBalance> findByTeacherId(UUID teacherId);
    
    List<LeaveBalance> findByTeacherIdAndYear(UUID teacherId, Integer year);
    
    Optional<LeaveBalance> findByTeacherIdAndLeaveTypeIdAndYear(UUID teacherId, UUID leaveTypeId, Integer year);
    
    List<LeaveBalance> findBySchoolIdAndYear(UUID schoolId, Integer year);
    
    boolean existsByTeacherIdAndLeaveTypeIdAndYear(UUID teacherId, UUID leaveTypeId, Integer year);
}

