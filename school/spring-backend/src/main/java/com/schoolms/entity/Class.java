package com.schoolms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "classes", indexes = {
    @Index(name = "idx_classes_name", columnList = "name"),
    @Index(name = "idx_classes_grade", columnList = "grade"),
    @Index(name = "idx_classes_academic_year", columnList = "academic_year"),
    @Index(name = "idx_classes_class_teacher_id", columnList = "class_teacher_id"),
    @Index(name = "idx_classes_school_id", columnList = "school_id")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Class extends BaseEntity {
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(nullable = false)
    private Integer grade;
    
    @Column(length = 10)
    private String section;
    
    @Column(name = "academic_year", nullable = false, length = 50)
    private String academicYear;
    
    @Column(name = "class_teacher_id", columnDefinition = "UUID")
    private UUID classTeacherId;
    
    @Column(name = "room_number", length = 20)
    private String roomNumber;
    
    @Column(name = "max_students")
    private Integer maxStudents = 40;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "school_id", columnDefinition = "UUID")
    private UUID schoolId;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_teacher_id", insertable = false, updatable = false)
    private Teacher classTeacher;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", insertable = false, updatable = false)
    private School school;
}
