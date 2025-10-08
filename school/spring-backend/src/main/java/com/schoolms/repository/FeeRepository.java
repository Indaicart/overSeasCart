package com.schoolms.repository;

import com.schoolms.entity.Fee;
import com.schoolms.enums.FeeStatus;
import com.schoolms.enums.FeeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface FeeRepository extends JpaRepository<Fee, UUID>, JpaSpecificationExecutor<Fee> {
    
    List<Fee> findByStudentId(UUID studentId);
    
    Page<Fee> findByStudentId(UUID studentId, Pageable pageable);
    
    List<Fee> findByStudentIdAndStatus(UUID studentId, FeeStatus status);
    
    Page<Fee> findByStudentIdAndStatus(UUID studentId, FeeStatus status, Pageable pageable);
    
    List<Fee> findByStatus(FeeStatus status);
    
    Page<Fee> findByStatus(FeeStatus status, Pageable pageable);
    
    List<Fee> findByDueDateBefore(LocalDate date);
    
    List<Fee> findByStatusAndDueDateBefore(FeeStatus status, LocalDate date);
    
    @Query("SELECT SUM(f.amount - f.paidAmount) FROM Fee f WHERE f.studentId = :studentId AND f.status IN ('pending', 'partial', 'overdue')")
    BigDecimal getTotalOutstandingByStudent(@Param("studentId") UUID studentId);
    
    @Query("SELECT SUM(f.amount) FROM Fee f WHERE f.studentId = :studentId")
    BigDecimal getTotalFeesByStudent(@Param("studentId") UUID studentId);
    
    @Query("SELECT SUM(f.paidAmount) FROM Fee f WHERE f.studentId = :studentId")
    BigDecimal getTotalPaidByStudent(@Param("studentId") UUID studentId);
    
    List<Fee> findByStudentIdAndFeeType(UUID studentId, FeeType feeType);
}
