package com.schoolms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "testimonials", indexes = {
    @Index(name = "idx_testimonials_school", columnList = "school_id")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Testimonial extends BaseEntity {
    
    @Column(name = "school_id", nullable = false, columnDefinition = "UUID")
    private UUID schoolId;
    
    @Column(name = "author_name", nullable = false, length = 255)
    private String authorName;
    
    @Column(name = "author_role", length = 100)
    private String authorRole;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Column
    private Integer rating; // 1-5
    
    @Column(name = "is_published")
    private Boolean isPublished = false;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", insertable = false, updatable = false)
    private School school;
}

