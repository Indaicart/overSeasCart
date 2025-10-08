package com.schoolms.entity;

import com.schoolms.enums.LeaveApplicationStatus;
import com.schoolms.enums.LeaveDayType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "leave_applications", indexes = {
    @Index(name = "idx_leave_applications_school_teacher_status", columnList = "school_id, teacher_id, status"),
    @Index(name = "idx_leave_applications_dates", columnList = "start_date, end_date"),
    @Index(name = "idx_leave_applications_number", columnList = "application_number")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class LeaveApplication extends BaseEntity {
    
    @Column(name = "school_id", nullable = false, columnDefinition = "UUID")
    private UUID schoolId;
    
    @Column(name = "teacher_id", nullable = false, columnDefinition = "UUID")
    private UUID teacherId;
    
    @Column(name = "leave_type_id", nullable = false, columnDefinition = "UUID")
    private UUID leaveTypeId;
    
    // Application details
    @Column(name = "application_number", unique = true, nullable = false, length = 50)
    private String applicationNumber;
    
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
    
    @Column(name = "total_days", nullable = false, precision = 5, scale = 1)
    private BigDecimal totalDays;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "day_type", length = 20)
    private LeaveDayType dayType = LeaveDayType.FULL_DAY;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;
    
    @Column(name = "contact_during_leave", length = 15)
    private String contactDuringLeave;
    
    @Column(name = "attachment_url", columnDefinition = "TEXT")
    private String attachmentUrl;
    
    // Approval workflow
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private LeaveApplicationStatus status = LeaveApplicationStatus.PENDING;
    
    @Column(name = "reviewed_by", columnDefinition = "UUID")
    private UUID reviewedBy;
    
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
    
    @Column(name = "review_comments", columnDefinition = "TEXT")
    private String reviewComments;
    
    // Flags
    @Column(name = "is_emergency")
    private Boolean isEmergency = false;
    
    @Column(name = "affects_salary")
    private Boolean affectsSalary = false;
    
    @Column(name = "salary_deduction_days", precision = 5, scale = 1)
    private BigDecimal salaryDeductionDays = BigDecimal.ZERO;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", insertable = false, updatable = false)
    private School school;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", insertable = false, updatable = false)
    private Teacher teacher;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_type_id", insertable = false, updatable = false)
    private LeaveType leaveType;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by", insertable = false, updatable = false)
    private User reviewer;
}

