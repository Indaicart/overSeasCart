package com.schoolms.dto.subscription;

import com.schoolms.enums.PlanType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlanResponse {
    
    private UUID id;
    private String name;
    private PlanType planType;
    private String description;
    private Double monthlyPrice;
    private Double yearlyPrice;
    private Integer maxStudents;
    private Integer maxTeachers;
    private Integer maxClasses;
    private Boolean isActive;
    private List<String> features;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

