package com.schoolms.service;

import com.schoolms.dto.feature.FeatureResponse;
import com.schoolms.dto.feature.PlanFeatureResponse;
import com.schoolms.entity.Feature;
import com.schoolms.entity.PlanFeature;
import com.schoolms.entity.SubscriptionPlan;
import com.schoolms.exception.BadRequestException;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.repository.FeatureRepository;
import com.schoolms.repository.PlanFeatureRepository;
import com.schoolms.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeatureManagementService {
    
    private final FeatureRepository featureRepository;
    private final PlanFeatureRepository planFeatureRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    
    public List<FeatureResponse> getAllFeatures() {
        List<Feature> features = featureRepository.findAll();
        return features.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    public List<FeatureResponse> getEnabledFeatures() {
        List<Feature> features = featureRepository.findByIsEnabled(true);
        return features.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    public List<FeatureResponse> getFeaturesByPlan(UUID planId) {
        List<PlanFeature> planFeatures = planFeatureRepository.findByPlanId(planId);
        return planFeatures.stream()
            .filter(PlanFeature::getIsEnabled)
            .map(pf -> {
                Feature feature = featureRepository.findById(pf.getFeatureId()).orElse(null);
                return feature != null ? mapToResponse(feature) : null;
            })
            .filter(response -> response != null)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public void toggleFeature(UUID featureId) {
        Feature feature = featureRepository.findById(featureId)
            .orElseThrow(() -> new ResourceNotFoundException("Feature", "id", featureId));
        
        feature.setIsEnabled(!feature.getIsEnabled());
        featureRepository.save(feature);
        log.info("Feature {} toggled to: {}", feature.getName(), feature.getIsEnabled());
    }
    
    @Transactional
    public PlanFeatureResponse assignFeatureToPlan(UUID planId, UUID featureId) {
        log.info("Assigning feature {} to plan {}", featureId, planId);
        
        subscriptionPlanRepository.findById(planId)
            .orElseThrow(() -> new ResourceNotFoundException("SubscriptionPlan", "id", planId));
        
        Feature feature = featureRepository.findById(featureId)
            .orElseThrow(() -> new ResourceNotFoundException("Feature", "id", featureId));
        
        // Check if already assigned
        if (planFeatureRepository.existsByPlanIdAndFeatureId(planId, featureId)) {
            throw new BadRequestException("Feature already assigned to this plan");
        }
        
        PlanFeature planFeature = new PlanFeature();
        planFeature.setPlanId(planId);
        planFeature.setFeatureId(featureId);
        planFeature.setIsEnabled(true);
        
        planFeature = planFeatureRepository.save(planFeature);
        return mapPlanFeatureToResponse(planFeature);
    }
    
    @Transactional
    public void removeFeatureFromPlan(UUID planId, UUID featureId) {
        log.info("Removing feature {} from plan {}", featureId, planId);
        planFeatureRepository.deleteByPlanIdAndFeatureId(planId, featureId);
    }
    
    @Transactional
    public void togglePlanFeature(UUID planId, UUID featureId) {
        PlanFeature planFeature = planFeatureRepository.findByPlanIdAndFeatureId(planId, featureId)
            .orElseThrow(() -> new ResourceNotFoundException("PlanFeature not found"));
        
        planFeature.setIsEnabled(!planFeature.getIsEnabled());
        planFeatureRepository.save(planFeature);
        log.info("Plan feature toggled to: {}", planFeature.getIsEnabled());
    }
    
    public List<PlanFeatureResponse> getPlanFeatures(UUID planId) {
        List<PlanFeature> planFeatures = planFeatureRepository.findByPlanId(planId);
        return planFeatures.stream()
            .map(this::mapPlanFeatureToResponse)
            .collect(Collectors.toList());
    }
    
    private FeatureResponse mapToResponse(Feature feature) {
        return FeatureResponse.builder()
            .id(feature.getId())
            .name(feature.getName())
            .code(feature.getCode())
            .description(feature.getDescription())
            .category(feature.getCategory())
            .isEnabled(feature.getIsEnabled())
            .createdAt(feature.getCreatedAt())
            .updatedAt(feature.getUpdatedAt())
            .build();
    }
    
    private PlanFeatureResponse mapPlanFeatureToResponse(PlanFeature planFeature) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(planFeature.getPlanId()).orElse(null);
        Feature feature = featureRepository.findById(planFeature.getFeatureId()).orElse(null);
        
        return PlanFeatureResponse.builder()
            .planId(planFeature.getPlanId())
            .planName(plan != null ? plan.getName() : null)
            .featureId(planFeature.getFeatureId())
            .featureName(feature != null ? feature.getName() : null)
            .isEnabled(planFeature.getIsEnabled())
            .build();
    }
}

