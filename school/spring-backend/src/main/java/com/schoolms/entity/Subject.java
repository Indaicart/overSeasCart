package com.schoolms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "subjects", indexes = {
    @Index(name = "idx_subjects_code", columnList = "code"),
    @Index(name = "idx_subjects_department", columnList = "department"),
    @Index(name = "idx_subjects_is_active", columnList = "is_active"),
    @Index(name = "idx_subjects_school_id", columnList = "school_id")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Subject extends BaseEntity {
    
    @Column(nullable = false, length = 255)
    private String name;
    
    @Column(unique = true, nullable = false, length = 50)
    private String code;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(length = 100)
    private String department;
    
    @Column
    private Integer credits = 1;
    
    @Column(name = "is_core")
    private Boolean isCore = true;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "school_id", columnDefinition = "UUID")
    private UUID schoolId;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", insertable = false, updatable = false)
    private School school;
}
