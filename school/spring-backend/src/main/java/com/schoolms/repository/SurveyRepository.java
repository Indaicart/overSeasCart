package com.schoolms.repository;

import com.schoolms.entity.Survey;
import com.schoolms.enums.SurveyStatus;
import com.schoolms.enums.TargetAudience;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SurveyRepository extends JpaRepository<Survey, UUID>, JpaSpecificationExecutor<Survey> {
    
    List<Survey> findBySchoolId(UUID schoolId);
    
    Page<Survey> findBySchoolId(UUID schoolId, Pageable pageable);
    
    List<Survey> findBySchoolIdAndStatus(UUID schoolId, SurveyStatus status);
    
    Page<Survey> findBySchoolIdAndStatus(UUID schoolId, SurveyStatus status, Pageable pageable);
    
    List<Survey> findBySchoolIdAndTargetAudience(UUID schoolId, TargetAudience targetAudience);
    
    List<Survey> findByCreatedBy(UUID createdBy);
    
    List<Survey> findBySchoolIdAndIsGraded(UUID schoolId, Boolean isGraded);
}

