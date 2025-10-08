package com.schoolms.dto.portal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentPortalDashboardResponse {
    
    // Student Info
    private StudentInfo studentInfo;
    
    // Attendance Summary
    private AttendanceSummary attendanceSummary;
    
    // Grade Summary
    private GradeSummary gradeSummary;
    
    // Fee Summary
    private FeeSummary feeSummary;
    
    // Upcoming Events
    private List<UpcomingClass> todaySchedule;
    
    // Recent Notifications
    private List<NotificationItem> recentNotifications;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentInfo {
        private String studentId;
        private String fullName;
        private String className;
        private String section;
        private String rollNumber;
        private String profileImage;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceSummary {
        private Long totalDays;
        private Long presentDays;
        private Long absentDays;
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
        private Map<String, Double> subjectAverages;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeeSummary {
        private Double totalFees;
        private Double paidAmount;
        private Double dueAmount;
        private Long pendingCount;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpcomingClass {
        private String subjectName;
        private String teacherName;
        private String startTime;
        private String endTime;
        private String roomNumber;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationItem {
        private String title;
        private String message;
        private String category;
        private Boolean isRead;
        private String createdAt;
    }
}

