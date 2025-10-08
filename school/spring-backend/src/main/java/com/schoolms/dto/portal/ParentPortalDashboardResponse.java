package com.schoolms.dto.portal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParentPortalDashboardResponse {
    
    private ParentInfo parentInfo;
    private List<ChildDashboard> children;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParentInfo {
        private String fullName;
        private String email;
        private String phone;
        private Integer childrenCount;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChildDashboard {
        private UUID studentId;
        private String studentName;
        private String studentIdNumber;
        private String className;
        private String section;
        private String relationship;
        private Boolean isPrimaryGuardian;
        private AttendanceSummary attendanceSummary;
        private GradeSummary gradeSummary;
        private FeeSummary feeSummary;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceSummary {
        private Long totalDays;
        private Long presentDays;
        private Double attendancePercentage;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GradeSummary {
        private Long totalAssessments;
        private Double averagePercentage;
        private String overallGrade;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeeSummary {
        private Double totalFees;
        private Double paidAmount;
        private Double dueAmount;
    }
}

