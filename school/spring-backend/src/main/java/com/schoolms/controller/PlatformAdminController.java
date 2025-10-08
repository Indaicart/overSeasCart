package com.schoolms.controller;

import com.schoolms.dto.admin.PlatformStatsResponse;
import com.schoolms.dto.school.SchoolResponse;
import com.schoolms.dto.subscription.SubscriptionResponse;
import com.schoolms.enums.SubscriptionStatus;
import com.schoolms.service.PlatformAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/platform")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PlatformAdminController {
    
    private final PlatformAdminService platformAdminService;
    
    @GetMapping("/stats")
    public ResponseEntity<PlatformStatsResponse> getPlatformStats() {
        log.info("Get platform statistics request");
        PlatformStatsResponse response = platformAdminService.getPlatformStats();
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/schools")
    public ResponseEntity<List<SchoolResponse>> getAllSchools() {
        List<SchoolResponse> response = platformAdminService.getAllSchools();
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/schools/page")
    public ResponseEntity<Page<SchoolResponse>> getAllSchoolsPaginated(Pageable pageable) {
        Page<SchoolResponse> response = platformAdminService.getAllSchools(pageable);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/subscriptions")
    public ResponseEntity<List<SubscriptionResponse>> getAllSubscriptions() {
        List<SubscriptionResponse> response = platformAdminService.getAllSubscriptions();
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/subscriptions/status/{status}")
    public ResponseEntity<List<SubscriptionResponse>> getSubscriptionsByStatus(@PathVariable SubscriptionStatus status) {
        List<SubscriptionResponse> response = platformAdminService.getSubscriptionsByStatus(status);
        return ResponseEntity.ok(response);
    }
}

