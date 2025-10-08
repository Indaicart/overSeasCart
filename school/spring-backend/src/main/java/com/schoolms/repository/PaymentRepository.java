package com.schoolms.repository;

import com.schoolms.entity.Payment;
import com.schoolms.enums.PaymentStatus;
import com.schoolms.enums.PaymentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID>, JpaSpecificationExecutor<Payment> {
    
    List<Payment> findBySchoolId(UUID schoolId);
    
    Page<Payment> findBySchoolId(UUID schoolId, Pageable pageable);
    
    List<Payment> findByUserId(UUID userId);
    
    Page<Payment> findByUserId(UUID userId, Pageable pageable);
    
    List<Payment> findByStudentId(UUID studentId);
    
    Page<Payment> findByStudentId(UUID studentId, Pageable pageable);
    
    List<Payment> findByStatus(PaymentStatus status);
    
    List<Payment> findBySchoolIdAndStatus(UUID schoolId, PaymentStatus status);
    
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    
    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);
    
    Optional<Payment> findByReceiptNumber(String receiptNumber);
    
    List<Payment> findByPaymentType(PaymentType paymentType);
    
    List<Payment> findBySchoolIdAndPaymentType(UUID schoolId, PaymentType paymentType);
    
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.schoolId = :schoolId AND p.status = 'SUCCESS'")
    BigDecimal getTotalSuccessfulPaymentsBySchool(@Param("schoolId") UUID schoolId);
    
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.studentId = :studentId AND p.status = 'SUCCESS'")
    BigDecimal getTotalSuccessfulPaymentsByStudent(@Param("studentId") UUID studentId);
}

