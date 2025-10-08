package com.schoolms.controller;

import com.schoolms.dto.subscription.SubscriptionCreateRequest;
import com.schoolms.dto.subscription.SubscriptionPlanResponse;
import com.schoolms.dto.subscription.SubscriptionResponse;
import com.schoolms.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/subscriptions")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SubscriptionController {
    
    private final SubscriptionService subscriptionService;
    
    @PostMapping
    public ResponseEntity<SubscriptionResponse> createSubscription(@Valid @RequestBody SubscriptionCreateRequest request) {
        SubscriptionResponse response = subscriptionService.createSubscription(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SubscriptionResponse> getSubscriptionById(@PathVariable UUID id) {
        SubscriptionResponse response = subscriptionService.getSubscriptionById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/school/{schoolId}/active")
    public ResponseEntity<SubscriptionResponse> getActiveSubscriptionBySchool(@PathVariable UUID schoolId) {
        SubscriptionResponse response = subscriptionService.getActiveSubscriptionBySchool(schoolId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/school/{schoolId}")
    public ResponseEntity<List<SubscriptionResponse>> getSubscriptionsBySchool(@PathVariable UUID schoolId) {
        List<SubscriptionResponse> response = subscriptionService.getSubscriptionsBySchool(schoolId);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<SubscriptionResponse> cancelSubscription(@PathVariable UUID id) {
        SubscriptionResponse response = subscriptionService.cancelSubscription(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/plans")
    public ResponseEntity<List<SubscriptionPlanResponse>> getAllPlans() {
        List<SubscriptionPlanResponse> response = subscriptionService.getAllPlans();
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/plans/active")
    public ResponseEntity<List<SubscriptionPlanResponse>> getActivePlans() {
        List<SubscriptionPlanResponse> response = subscriptionService.getActivePlans();
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/plans/{id}")
    public ResponseEntity<SubscriptionPlanResponse> getPlanById(@PathVariable UUID id) {
        SubscriptionPlanResponse response = subscriptionService.getPlanById(id);
        return ResponseEntity.ok(response);
    }
}

