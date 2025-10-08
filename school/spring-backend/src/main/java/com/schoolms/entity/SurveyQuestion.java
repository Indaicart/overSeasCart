package com.schoolms.entity;

import com.schoolms.enums.QuestionType;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "survey_questions", indexes = {
    @Index(name = "idx_survey_questions_survey", columnList = "survey_id")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class SurveyQuestion extends BaseEntity {
    
    @Column(name = "survey_id", nullable = false, columnDefinition = "UUID")
    private UUID surveyId;
    
    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false, length = 20)
    private QuestionType questionType;
    
    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private List<String> options; // For multiple choice
    
    @Column(name = "correct_answer", columnDefinition = "TEXT")
    private String correctAnswer;
    
    @Column
    private Integer marks = 0;
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
    
    @Column(name = "is_required")
    private Boolean isRequired = true;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "survey_id", insertable = false, updatable = false)
    private Survey survey;
}

