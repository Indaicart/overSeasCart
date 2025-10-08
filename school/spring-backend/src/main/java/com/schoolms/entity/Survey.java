package com.schoolms.entity;

import com.schoolms.enums.SurveyStatus;
import com.schoolms.enums.SurveyType;
import com.schoolms.enums.TargetAudience;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "surveys", indexes = {
    @Index(name = "idx_surveys_school", columnList = "school_id"),
    @Index(name = "idx_surveys_status", columnList = "status")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Survey extends BaseEntity {
    
    @Column(name = "school_id", nullable = false, columnDefinition = "UUID")
    private UUID schoolId;
    
    @Column(nullable = false, length = 255)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "survey_type", nullable = false, length = 20)
    private SurveyType surveyType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "target_audience", nullable = false, length = 20)
    private TargetAudience targetAudience;
    
    @Column(name = "is_graded")
    private Boolean isGraded = false;
    
    @Column(name = "total_marks")
    private Integer totalMarks = 0;
    
    @Column(name = "passing_marks")
    private Integer passingMarks = 0;
    
    @Column(name = "time_limit_minutes")
    private Integer timeLimitMinutes;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private SurveyStatus status = SurveyStatus.DRAFT;
    
    @Column(name = "start_date")
    private LocalDateTime startDate;
    
    @Column(name = "end_date")
    private LocalDateTime endDate;
    
    @Column(name = "created_by", columnDefinition = "UUID")
    private UUID createdBy;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", insertable = false, updatable = false)
    private School school;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", insertable = false, updatable = false)
    private User creator;
}

