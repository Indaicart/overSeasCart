package com.schoolms.controller;

import com.schoolms.dto.feature.FeatureResponse;
import com.schoolms.dto.feature.PlanFeatureResponse;
import com.schoolms.service.FeatureManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/features")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class FeatureManagementController {
    
    private final FeatureManagementService featureManagementService;
    
    @GetMapping
    public ResponseEntity<List<FeatureResponse>> getAllFeatures() {
        List<FeatureResponse> response = featureManagementService.getAllFeatures();
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/enabled")
    public ResponseEntity<List<FeatureResponse>> getEnabledFeatures() {
        List<FeatureResponse> response = featureManagementService.getEnabledFeatures();
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/plan/{planId}")
    public ResponseEntity<List<FeatureResponse>> getFeaturesByPlan(@PathVariable UUID planId) {
        List<FeatureResponse> response = featureManagementService.getFeaturesByPlan(planId);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{featureId}/toggle")
    public ResponseEntity<Void> toggleFeature(@PathVariable UUID featureId) {
        featureManagementService.toggleFeature(featureId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/plan/{planId}/feature/{featureId}")
    public ResponseEntity<PlanFeatureResponse> assignFeatureToPlan(
            @PathVariable UUID planId, @PathVariable UUID featureId) {
        PlanFeatureResponse response = featureManagementService.assignFeatureToPlan(planId, featureId);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/plan/{planId}/feature/{featureId}")
    public ResponseEntity<Void> removeFeatureFromPlan(
            @PathVariable UUID planId, @PathVariable UUID featureId) {
        featureManagementService.removeFeatureFromPlan(planId, featureId);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/plan/{planId}/feature/{featureId}/toggle")
    public ResponseEntity<Void> togglePlanFeature(
            @PathVariable UUID planId, @PathVariable UUID featureId) {
        featureManagementService.togglePlanFeature(planId, featureId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/plan/{planId}/all")
    public ResponseEntity<List<PlanFeatureResponse>> getPlanFeatures(@PathVariable UUID planId) {
        List<PlanFeatureResponse> response = featureManagementService.getPlanFeatures(planId);
        return ResponseEntity.ok(response);
    }
}

