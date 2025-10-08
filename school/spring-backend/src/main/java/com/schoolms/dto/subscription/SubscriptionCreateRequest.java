package com.schoolms.dto.subscription;

import com.schoolms.enums.BillingCycle;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionCreateRequest {
    
    @NotNull(message = "School ID is required")
    private UUID schoolId;
    
    @NotNull(message = "Plan ID is required")
    private UUID planId;
    
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    
    @NotNull(message = "End date is required")
    private LocalDate endDate;
    
    @NotNull(message = "Billing cycle is required")
    private BillingCycle billingCycle;
    
    @NotNull(message = "Amount is required")
    private Double amount;
    
    private Boolean autoRenew;
    private LocalDate trialEndDate;
}

