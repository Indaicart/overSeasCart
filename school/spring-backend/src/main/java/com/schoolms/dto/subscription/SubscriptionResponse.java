package com.schoolms.dto.subscription;

import com.schoolms.enums.BillingCycle;
import com.schoolms.enums.PlanType;
import com.schoolms.enums.SubscriptionStatus;
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
public class SubscriptionResponse {
    
    private UUID id;
    private UUID schoolId;
    private String schoolName;
    private UUID planId;
    private String planName;
    private PlanType planType;
    private SubscriptionStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private BillingCycle billingCycle;
    private Double amount;
    private Boolean autoRenew;
    private LocalDate trialEndDate;
    private Integer maxStudents;
    private Integer maxTeachers;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

