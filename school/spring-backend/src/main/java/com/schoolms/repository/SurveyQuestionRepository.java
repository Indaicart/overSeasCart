package com.schoolms.repository;

import com.schoolms.entity.SurveyQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SurveyQuestionRepository extends JpaRepository<SurveyQuestion, UUID>, JpaSpecificationExecutor<SurveyQuestion> {
    
    List<SurveyQuestion> findBySurveyId(UUID surveyId);
    
    List<SurveyQuestion> findBySurveyIdOrderByDisplayOrder(UUID surveyId);
    
    long countBySurveyId(UUID surveyId);
}

