package com.schoolms.repository;

import com.schoolms.entity.SurveyResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SurveyResponseRepository extends JpaRepository<SurveyResponse, UUID>, JpaSpecificationExecutor<SurveyResponse> {
    
    List<SurveyResponse> findBySurveyId(UUID surveyId);
    
    Page<SurveyResponse> findBySurveyId(UUID surveyId, Pageable pageable);
    
    List<SurveyResponse> findByUserId(UUID userId);
    
    Page<SurveyResponse> findByUserId(UUID userId, Pageable pageable);
    
    Optional<SurveyResponse> findBySurveyIdAndUserId(UUID surveyId, UUID userId);
    
    List<SurveyResponse> findBySurveyIdAndIsGraded(UUID surveyId, Boolean isGraded);
    
    long countBySurveyId(UUID surveyId);
    
    @Query("SELECT AVG(sr.percentage) FROM SurveyResponse sr WHERE sr.surveyId = :surveyId AND sr.isGraded = true")
    Double getAverageScoreBySurvey(@Param("surveyId") UUID surveyId);
}

