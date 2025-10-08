package com.schoolms.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformStatsResponse {
    
    private Long totalSchools;
    private Long activeSchools;
    private Long totalStudents;
    private Long totalTeachers;
    private Long totalParents;
    private Long activeSubscriptions;
    private Double totalRevenue;
    
    private Map<String, Long> subscriptionsByPlan;
    private Map<String, Long> subscriptionsByStatus;
}

