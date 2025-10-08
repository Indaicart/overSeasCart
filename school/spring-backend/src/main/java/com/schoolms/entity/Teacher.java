package com.schoolms.entity;

import com.schoolms.enums.EmploymentType;
import com.schoolms.enums.TeacherStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "teachers", indexes = {
    @Index(name = "idx_teachers_teacher_id", columnList = "teacher_id"),
    @Index(name = "idx_teachers_employee_number", columnList = "employee_number"),
    @Index(name = "idx_teachers_user_id", columnList = "user_id"),
    @Index(name = "idx_teachers_status", columnList = "status"),
    @Index(name = "idx_teachers_class_teacher_for", columnList = "class_teacher_for"),
    @Index(name = "idx_teachers_school_id", columnList = "school_id")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Teacher extends BaseEntity {
    
    @Column(name = "user_id", columnDefinition = "UUID")
    private UUID userId;
    
    @Column(name = "teacher_id", unique = true, nullable = false, length = 50)
    private String teacherId;
    
    @Column(name = "employee_number", unique = true, length = 50)
    private String employeeNumber;
    
    @Column(name = "date_of_joining", nullable = false)
    private LocalDate dateOfJoining;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TeacherStatus status = TeacherStatus.ACTIVE;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", length = 20)
    private EmploymentType employmentType = EmploymentType.FULL_TIME;
    
    @Column(length = 255)
    private String qualification;
    
    @Column(length = 255)
    private String specialization;
    
    @Column(name = "experience_years")
    private Integer experienceYears;
    
    @Column(name = "class_teacher_for", columnDefinition = "UUID")
    private UUID classTeacherFor;
    
    @Column(name = "subjects_teaching", columnDefinition = "text[]")
    private String[] subjectsTeaching;
    
    @Column(name = "salary_grade", length = 50)
    private String salaryGrade;
    
    @Column(name = "bank_account_number", length = 50)
    private String bankAccountNumber;
    
    @Column(name = "bank_name", length = 255)
    private String bankName;
    
    @Column(name = "bank_ifsc", length = 20)
    private String bankIfsc;
    
    @Column(name = "pan_number", length = 20)
    private String panNumber;
    
    @Column(name = "aadhar_number", length = 20)
    private String aadharNumber;
    
    @Column(name = "emergency_contact_name", length = 255)
    private String emergencyContactName;
    
    @Column(name = "emergency_contact_phone", length = 20)
    private String emergencyContactPhone;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "school_id", columnDefinition = "UUID")
    private UUID schoolId;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_teacher_for", insertable = false, updatable = false)
    private Class teacherClass;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", insertable = false, updatable = false)
    private School school;
}
