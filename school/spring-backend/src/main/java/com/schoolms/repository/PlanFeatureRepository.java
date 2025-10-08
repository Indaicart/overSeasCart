package com.schoolms.repository;

import com.schoolms.entity.PlanFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlanFeatureRepository extends JpaRepository<PlanFeature, UUID>, JpaSpecificationExecutor<PlanFeature> {
    
    List<PlanFeature> findByPlanId(UUID planId);
    
    List<PlanFeature> findByFeatureId(UUID featureId);
    
    List<PlanFeature> findByPlanIdAndIsEnabled(UUID planId, Boolean isEnabled);
    
    Optional<PlanFeature> findByPlanIdAndFeatureId(UUID planId, UUID featureId);
    
    boolean existsByPlanIdAndFeatureId(UUID planId, UUID featureId);
    
    void deleteByPlanIdAndFeatureId(UUID planId, UUID featureId);
}

