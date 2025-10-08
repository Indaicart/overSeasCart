package com.schoolms.entity;

import com.schoolms.enums.RelationshipType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "student_parents", 
    uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "parent_id"}),
    indexes = {
        @Index(name = "idx_student_parents_student", columnList = "student_id"),
        @Index(name = "idx_student_parents_parent", columnList = "parent_id"),
        @Index(name = "idx_student_parents_primary", columnList = "is_primary")
    }
)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class StudentParent extends BaseEntity {
    
    @Column(name = "student_id", nullable = false, columnDefinition = "UUID")
    private UUID studentId;
    
    @Column(name = "parent_id", nullable = false, columnDefinition = "UUID")
    private UUID parentId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RelationshipType relationship;
    
    @Column(name = "is_primary")
    private Boolean isPrimary = false;
    
    @Column(name = "can_pickup")
    private Boolean canPickup = false;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", insertable = false, updatable = false)
    private Student student;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", insertable = false, updatable = false)
    private Parent parent;
}

