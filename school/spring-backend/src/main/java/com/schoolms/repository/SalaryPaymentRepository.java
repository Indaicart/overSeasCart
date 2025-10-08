package com.schoolms.repository;

import com.schoolms.entity.SalaryPayment;
import com.schoolms.enums.SalaryPaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalaryPaymentRepository extends JpaRepository<SalaryPayment, UUID>, JpaSpecificationExecutor<SalaryPayment> {
    
    List<SalaryPayment> findBySchoolId(UUID schoolId);
    
    Page<SalaryPayment> findBySchoolId(UUID schoolId, Pageable pageable);
    
    List<SalaryPayment> findByTeacherId(UUID teacherId);
    
    Page<SalaryPayment> findByTeacherId(UUID teacherId, Pageable pageable);
    
    List<SalaryPayment> findByPaymentStatus(SalaryPaymentStatus status);
    
    List<SalaryPayment> findBySchoolIdAndPaymentStatus(UUID schoolId, SalaryPaymentStatus status);
    
    Page<SalaryPayment> findBySchoolIdAndPaymentStatus(UUID schoolId, SalaryPaymentStatus status, Pageable pageable);
    
    Optional<SalaryPayment> findByTeacherIdAndPaymentMonthAndPaymentYear(UUID teacherId, Integer paymentMonth, Integer paymentYear);
    
    List<SalaryPayment> findByPaymentMonthAndPaymentYear(Integer paymentMonth, Integer paymentYear);
    
    List<SalaryPayment> findBySchoolIdAndPaymentMonthAndPaymentYear(UUID schoolId, Integer paymentMonth, Integer paymentYear);
    
    Optional<SalaryPayment> findBySlipNumber(String slipNumber);
    
    @Query("SELECT COUNT(sp) FROM SalaryPayment sp WHERE sp.schoolId = :schoolId AND sp.paymentStatus = 'PENDING'")
    long countPendingPaymentsBySchool(@Param("schoolId") UUID schoolId);
}

