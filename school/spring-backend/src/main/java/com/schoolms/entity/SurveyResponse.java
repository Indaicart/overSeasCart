package com.schoolms.entity;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "survey_responses", indexes = {
    @Index(name = "idx_survey_responses_survey", columnList = "survey_id"),
    @Index(name = "idx_survey_responses_user", columnList = "user_id")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class SurveyResponse extends BaseEntity {
    
    @Column(name = "survey_id", nullable = false, columnDefinition = "UUID")
    private UUID surveyId;
    
    @Column(name = "user_id", nullable = false, columnDefinition = "UUID")
    private UUID userId;
    
    @Type(JsonBinaryType.class)
    @Column(nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> answers; // {question_id: answer}
    
    @Column
    private Integer score;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal percentage;
    
    @Column(name = "is_graded")
    private Boolean isGraded = false;
    
    @Column(name = "graded_by", columnDefinition = "UUID")
    private UUID gradedBy;
    
    @Column(name = "graded_at")
    private LocalDateTime gradedAt;
    
    @Column(columnDefinition = "TEXT")
    private String feedback;
    
    @Column(name = "time_taken_minutes")
    private Integer timeTakenMinutes;
    
    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "survey_id", insertable = false, updatable = false)
    private Survey survey;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graded_by", insertable = false, updatable = false)
    private User grader;
}

