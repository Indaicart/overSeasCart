package com.schoolms.dto.payment;

import com.schoolms.enums.PaymentMethod;
import com.schoolms.enums.PaymentType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCreateRequest {
    
    @NotNull(message = "Fee ID is required")
    private UUID feeId;
    
    @NotNull(message = "Amount is required")
    private Double amount;
    
    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
    
    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate;
    
    private String transactionId;
    private String remarks;
    
    @NotNull(message = "Payment type is required")
    private PaymentType paymentType;
    
    @NotNull(message = "School ID is required")
    private UUID schoolId;
}

