package com.schoolms.entity;

import com.schoolms.enums.PaymentMethod;
import com.schoolms.enums.PaymentStatus;
import com.schoolms.enums.PaymentType;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "payments", indexes = {
    @Index(name = "idx_payments_school", columnList = "school_id"),
    @Index(name = "idx_payments_user", columnList = "user_id"),
    @Index(name = "idx_payments_student", columnList = "student_id"),
    @Index(name = "idx_payments_fee", columnList = "fee_id"),
    @Index(name = "idx_payments_razorpay_order", columnList = "razorpay_order_id"),
    @Index(name = "idx_payments_razorpay_payment", columnList = "razorpay_payment_id"),
    @Index(name = "idx_payments_status", columnList = "status"),
    @Index(name = "idx_payments_type", columnList = "payment_type"),
    @Index(name = "idx_payments_receipt", columnList = "receipt_number")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Payment extends BaseEntity {
    
    @Column(name = "school_id", nullable = false, columnDefinition = "UUID")
    private UUID schoolId;
    
    @Column(name = "user_id", nullable = false, columnDefinition = "UUID")
    private UUID userId;
    
    @Column(name = "student_id", columnDefinition = "UUID")
    private UUID studentId;
    
    @Column(name = "fee_id", columnDefinition = "UUID")
    private UUID feeId;
    
    // Payment details
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false, length = 30)
    private PaymentType paymentType;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Column(length = 3)
    private String currency = "INR";
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PaymentStatus status = PaymentStatus.PENDING;
    
    // Razorpay details
    @Column(name = "razorpay_order_id", length = 100)
    private String razorpayOrderId;
    
    @Column(name = "razorpay_payment_id", length = 100)
    private String razorpayPaymentId;
    
    @Column(name = "razorpay_signature", length = 255)
    private String razorpaySignature;
    
    // Transaction details
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 20)
    private PaymentMethod paymentMethod;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> metadata;
    
    @Column(name = "receipt_number", length = 100)
    private String receiptNumber;
    
    // Refund details
    @Column(name = "refund_id", length = 100)
    private String refundId;
    
    @Column(name = "refund_amount", precision = 10, scale = 2)
    private BigDecimal refundAmount;
    
    @Column(name = "refund_date")
    private LocalDateTime refundDate;
    
    @Column(name = "refund_reason", columnDefinition = "TEXT")
    private String refundReason;
    
    // Error tracking
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    @Column(name = "error_code", length = 50)
    private String errorCode;
    
    @Column(name = "payment_date")
    private LocalDateTime paymentDate;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", insertable = false, updatable = false)
    private School school;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", insertable = false, updatable = false)
    private Student student;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fee_id", insertable = false, updatable = false)
    private Fee fee;
}

