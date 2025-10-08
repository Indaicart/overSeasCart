package com.schoolms.entity;

import com.schoolms.enums.AttendanceStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "attendance", indexes = {
    @Index(name = "idx_attendance_student_date", columnList = "student_id, date"),
    @Index(name = "idx_attendance_class_date", columnList = "class_id, date"),
    @Index(name = "idx_attendance_subject_date", columnList = "subject_id, date"),
    @Index(name = "idx_attendance_date", columnList = "date"),
    @Index(name = "idx_attendance_status", columnList = "status")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Attendance extends BaseEntity {
    
    @Column(name = "student_id", nullable = false, columnDefinition = "UUID")
    private UUID studentId;
    
    @Column(name = "class_id", nullable = false, columnDefinition = "UUID")
    private UUID classId;
    
    @Column(name = "subject_id", columnDefinition = "UUID")
    private UUID subjectId;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AttendanceStatus status;
    
    @Column(columnDefinition = "TEXT")
    private String remarks;
    
    @Column(name = "marked_by", columnDefinition = "UUID")
    private UUID markedBy;
    
    @Column(name = "attendance_type", length = 20)
    private String attendanceType = "class"; // 'class' or 'subject'
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", insertable = false, updatable = false)
    private Student student;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", insertable = false, updatable = false)
    private Class attendanceClass;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", insertable = false, updatable = false)
    private Subject subject;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marked_by", insertable = false, updatable = false)
    private User markedByUser;
}
