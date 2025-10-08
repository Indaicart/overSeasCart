package com.schoolms.entity;

import com.schoolms.enums.FeeStatus;
import com.schoolms.enums.FeeType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "fees", indexes = {
    @Index(name = "idx_fees_student_status", columnList = "student_id, status"),
    @Index(name = "idx_fees_due_date", columnList = "due_date"),
    @Index(name = "idx_fees_status", columnList = "status"),
    @Index(name = "idx_fees_transaction_id", columnList = "transaction_id")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Fee extends BaseEntity {
    
    @Column(name = "student_id", nullable = false, columnDefinition = "UUID")
    private UUID studentId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "fee_type", nullable = false, length = 20)
    private FeeType feeType;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private FeeStatus status = FeeStatus.PENDING;
    
    @Column(name = "paid_date")
    private LocalDate paidDate;
    
    @Column(name = "payment_method", length = 50)
    private String paymentMethod;
    
    @Column(name = "transaction_id", length = 100)
    private String transactionId;
    
    @Column(name = "paid_amount", precision = 10, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", insertable = false, updatable = false)
    private Student student;
}
