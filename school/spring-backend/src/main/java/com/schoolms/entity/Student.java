package com.schoolms.entity;

import com.schoolms.enums.StudentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "students", indexes = {
    @Index(name = "idx_students_student_id", columnList = "student_id"),
    @Index(name = "idx_students_admission_number", columnList = "admission_number"),
    @Index(name = "idx_students_class_id", columnList = "class_id"),
    @Index(name = "idx_students_status", columnList = "status"),
    @Index(name = "idx_students_user_id", columnList = "user_id"),
    @Index(name = "idx_students_school_id", columnList = "school_id")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Student extends BaseEntity {
    
    @Column(name = "user_id", columnDefinition = "UUID")
    private UUID userId;
    
    @Column(name = "student_id", unique = true, nullable = false, length = 50)
    private String studentId;
    
    @Column(name = "admission_number", unique = true, length = 50)
    private String admissionNumber;
    
    @Column(name = "admission_date", nullable = false)
    private LocalDate admissionDate;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private StudentStatus status = StudentStatus.ACTIVE;
    
    @Column(name = "class_id", columnDefinition = "UUID")
    private UUID classId;
    
    @Column(length = 10)
    private String section;
    
    @Column(name = "roll_number", length = 20)
    private String rollNumber;
    
    @Column(name = "blood_group", length = 10)
    private String bloodGroup;
    
    @Column(name = "medical_conditions", columnDefinition = "TEXT")
    private String medicalConditions;
    
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
    @JoinColumn(name = "class_id", insertable = false, updatable = false)
    private Class studentClass;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", insertable = false, updatable = false)
    private School school;
}
