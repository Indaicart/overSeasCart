package com.schoolms.entity;

import com.schoolms.enums.RelationshipType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "parents", indexes = {
    @Index(name = "idx_parents_user_id", columnList = "user_id")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Parent extends BaseEntity {
    
    @Column(name = "user_id", columnDefinition = "UUID")
    private UUID userId;
    
    @Column(length = 255)
    private String occupation;
    
    @Column(length = 255)
    private String workplace;
    
    @Column(name = "work_phone", length = 20)
    private String workPhone;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "relationship_to_student", nullable = false, length = 20)
    private RelationshipType relationshipToStudent;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
}

