package com.schoolms.entity;

import com.schoolms.enums.AssessmentType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "grades", indexes = {
    @Index(name = "idx_grades_student_subject", columnList = "student_id, subject_id"),
    @Index(name = "idx_grades_class_date", columnList = "class_id, assessment_date"),
    @Index(name = "idx_grades_assessment_type", columnList = "assessment_type"),
    @Index(name = "idx_grades_assessment_date", columnList = "assessment_date")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Grade extends BaseEntity {
    
    @Column(name = "student_id", nullable = false, columnDefinition = "UUID")
    private UUID studentId;
    
    @Column(name = "subject_id", nullable = false, columnDefinition = "UUID")
    private UUID subjectId;
    
    @Column(name = "class_id", nullable = false, columnDefinition = "UUID")
    private UUID classId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "assessment_type", nullable = false, length = 20)
    private AssessmentType assessmentType;
    
    @Column(name = "assessment_name", nullable = false, length = 255)
    private String assessmentName;
    
    @Column(name = "marks_obtained", nullable = false, precision = 5, scale = 2)
    private BigDecimal marksObtained;
    
    @Column(name = "total_marks", nullable = false, precision = 5, scale = 2)
    private BigDecimal totalMarks;
    
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal percentage;
    
    @Column(name = "grade_letter", length = 5)
    private String gradeLetter;
    
    @Column(precision = 3, scale = 2)
    private BigDecimal gpa;
    
    @Column(name = "assessment_date", nullable = false)
    private LocalDate assessmentDate;
    
    @Column(columnDefinition = "TEXT")
    private String comments;
    
    @Column(name = "graded_by", columnDefinition = "UUID")
    private UUID gradedBy;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", insertable = false, updatable = false)
    private Student student;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", insertable = false, updatable = false)
    private Subject subject;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", insertable = false, updatable = false)
    private Class gradeClass;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graded_by", insertable = false, updatable = false)
    private User gradedByUser;
}
