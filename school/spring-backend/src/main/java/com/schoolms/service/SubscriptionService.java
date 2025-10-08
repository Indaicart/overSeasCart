package com.schoolms.service;

import com.schoolms.dto.subscription.SubscriptionCreateRequest;
import com.schoolms.dto.subscription.SubscriptionPlanResponse;
import com.schoolms.dto.subscription.SubscriptionResponse;
import com.schoolms.entity.*;
import com.schoolms.enums.SubscriptionStatus;
import com.schoolms.exception.BadRequestException;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionService {
    
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final SchoolRepository schoolRepository;
    private final PlanFeatureRepository planFeatureRepository;
    private final FeatureRepository featureRepository;
    
    @Transactional
    public SubscriptionResponse createSubscription(SubscriptionCreateRequest request) {
        log.info("Creating subscription for school: {}", request.getSchoolId());
        
        School school = schoolRepository.findById(request.getSchoolId())
            .orElseThrow(() -> new ResourceNotFoundException("School", "id", request.getSchoolId()));
        
        SubscriptionPlan plan = subscriptionPlanRepository.findById(request.getPlanId())
            .orElseThrow(() -> new ResourceNotFoundException("SubscriptionPlan", "id", request.getPlanId()));
        
        // Check for existing active subscription
        List<Subscription> activeSubscriptions = subscriptionRepository
            .findBySchoolIdAndStatus(request.getSchoolId(), SubscriptionStatus.ACTIVE);
        
        if (!activeSubscriptions.isEmpty()) {
            throw new BadRequestException("School already has an active subscription");
        }
        
        Subscription subscription = new Subscription();
        subscription.setSchoolId(request.getSchoolId());
        subscription.setPlanId(request.getPlanId());
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setStartDate(request.getStartDate());
        subscription.setEndDate(request.getEndDate());
        subscription.setBillingCycle(request.getBillingCycle());
        subscription.setAmount(request.getAmount());
        subscription.setAutoRenew(request.getAutoRenew() != null ? request.getAutoRenew() : false);
        subscription.setTrialEndDate(request.getTrialEndDate());
        subscription.setMaxStudents(plan.getMaxStudents());
        subscription.setMaxTeachers(plan.getMaxTeachers());
        
        subscription = subscriptionRepository.save(subscription);
        log.info("Subscription created with ID: {}", subscription.getId());
        return mapToResponse(subscription);
    }
    
    public SubscriptionResponse getSubscriptionById(UUID id) {
        Subscription subscription = subscriptionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Subscription", "id", id));
        return mapToResponse(subscription);
    }
    
    public SubscriptionResponse getActiveSubscriptionBySchool(UUID schoolId) {
        List<Subscription> activeSubscriptions = subscriptionRepository
            .findBySchoolIdAndStatus(schoolId, SubscriptionStatus.ACTIVE);
        
        if (activeSubscriptions.isEmpty()) {
            throw new ResourceNotFoundException("Active subscription not found for school", "schoolId", schoolId);
        }
        
        return mapToResponse(activeSubscriptions.get(0));
    }
    
    public List<SubscriptionResponse> getSubscriptionsBySchool(UUID schoolId) {
        List<Subscription> subscriptions = subscriptionRepository.findBySchoolId(schoolId);
        return subscriptions.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    @Transactional
    public SubscriptionResponse cancelSubscription(UUID id) {
        Subscription subscription = subscriptionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Subscription", "id", id));
        
        subscription.setStatus(SubscriptionStatus.CANCELLED);
        subscription = subscriptionRepository.save(subscription);
        return mapToResponse(subscription);
    }
    
    @Transactional
    public void checkAndExpireSubscriptions() {
        LocalDate today = LocalDate.now();
        List<Subscription> activeSubscriptions = subscriptionRepository
            .findByStatus(SubscriptionStatus.ACTIVE);
        
        for (Subscription subscription : activeSubscriptions) {
            if (subscription.getEndDate().isBefore(today)) {
                subscription.setStatus(SubscriptionStatus.EXPIRED);
                subscriptionRepository.save(subscription);
                log.info("Subscription {} expired", subscription.getId());
            }
        }
    }
    
    // Subscription Plans
    public List<SubscriptionPlanResponse> getAllPlans() {
        List<SubscriptionPlan> plans = subscriptionPlanRepository.findAll();
        return plans.stream().map(this::mapPlanToResponse).collect(Collectors.toList());
    }
    
    public List<SubscriptionPlanResponse> getActivePlans() {
        List<SubscriptionPlan> plans = subscriptionPlanRepository.findByIsActive(true);
        return plans.stream().map(this::mapPlanToResponse).collect(Collectors.toList());
    }
    
    public SubscriptionPlanResponse getPlanById(UUID id) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("SubscriptionPlan", "id", id));
        return mapPlanToResponse(plan);
    }
    
    private SubscriptionResponse mapToResponse(Subscription subscription) {
        SubscriptionResponse response = SubscriptionResponse.builder()
            .id(subscription.getId())
            .schoolId(subscription.getSchoolId())
            .planId(subscription.getPlanId())
            .status(subscription.getStatus())
            .startDate(subscription.getStartDate())
            .endDate(subscription.getEndDate())
            .billingCycle(subscription.getBillingCycle())
            .amount(subscription.getAmount())
            .autoRenew(subscription.getAutoRenew())
            .trialEndDate(subscription.getTrialEndDate())
            .maxStudents(subscription.getMaxStudents())
            .maxTeachers(subscription.getMaxTeachers())
            .createdAt(subscription.getCreatedAt())
            .updatedAt(subscription.getUpdatedAt())
            .build();
        
        School school = schoolRepository.findById(subscription.getSchoolId()).orElse(null);
        if (school != null) response.setSchoolName(school.getName());
        
        SubscriptionPlan plan = subscriptionPlanRepository.findById(subscription.getPlanId()).orElse(null);
        if (plan != null) {
            response.setPlanName(plan.getName());
            response.setPlanType(plan.getPlanType());
        }
        
        return response;
    }
    
    private SubscriptionPlanResponse mapPlanToResponse(SubscriptionPlan plan) {
        SubscriptionPlanResponse response = SubscriptionPlanResponse.builder()
            .id(plan.getId())
            .name(plan.getName())
            .planType(plan.getPlanType())
            .description(plan.getDescription())
            .monthlyPrice(plan.getMonthlyPrice())
            .yearlyPrice(plan.getYearlyPrice())
            .maxStudents(plan.getMaxStudents())
            .maxTeachers(plan.getMaxTeachers())
            .maxClasses(plan.getMaxClasses())
            .isActive(plan.getIsActive())
            .createdAt(plan.getCreatedAt())
            .updatedAt(plan.getUpdatedAt())
            .build();
        
        // Get features for this plan
        List<PlanFeature> planFeatures = planFeatureRepository.findByPlanId(plan.getId());
        List<String> featureNames = planFeatures.stream()
            .map(pf -> {
                Feature feature = featureRepository.findById(pf.getFeatureId()).orElse(null);
                return feature != null ? feature.getName() : null;
            })
            .filter(name -> name != null)
            .collect(Collectors.toList());
        
        response.setFeatures(featureNames);
        
        return response;
    }
}

