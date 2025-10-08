package com.schoolms.entity;

import com.schoolms.enums.AchievementCategory;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "achievements", indexes = {
    @Index(name = "idx_achievements_school", columnList = "school_id")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Achievement extends BaseEntity {
    
    @Column(name = "school_id", nullable = false, columnDefinition = "UUID")
    private UUID schoolId;
    
    @Column(nullable = false, length = 255)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AchievementCategory category;
    
    @Column(name = "achievement_date", nullable = false)
    private LocalDate achievementDate;
    
    @Column(columnDefinition = "TEXT")
    private String participants;
    
    @Column(name = "is_published")
    private Boolean isPublished = false;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", insertable = false, updatable = false)
    private School school;
}

