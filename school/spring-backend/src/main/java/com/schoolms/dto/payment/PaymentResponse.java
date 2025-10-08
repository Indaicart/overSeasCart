package com.schoolms.dto.payment;

import com.schoolms.enums.PaymentMethod;
import com.schoolms.enums.PaymentStatus;
import com.schoolms.enums.PaymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    
    private UUID id;
    private UUID feeId;
    private UUID studentId;
    private String studentName;
    private Double amount;
    private PaymentMethod paymentMethod;
    private PaymentStatus status;
    private LocalDate paymentDate;
    private String transactionId;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
    private String receiptNumber;
    private String remarks;
    private PaymentType paymentType;
    private UUID schoolId;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

