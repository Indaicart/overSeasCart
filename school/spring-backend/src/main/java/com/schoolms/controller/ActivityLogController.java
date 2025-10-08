package com.schoolms.controller;

import com.schoolms.dto.activitylog.ActivityLogCreateRequest;
import com.schoolms.dto.activitylog.ActivityLogResponse;
import com.schoolms.enums.LogAction;
import com.schoolms.service.ActivityLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/activity-logs")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ActivityLogController {
    
    private final ActivityLogService activityLogService;
    
    @PostMapping
    public ResponseEntity<ActivityLogResponse> createLog(@Valid @RequestBody ActivityLogCreateRequest request) {
        ActivityLogResponse response = activityLogService.createLog(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ActivityLogResponse> getLogById(@PathVariable UUID id) {
        ActivityLogResponse response = activityLogService.getLogById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ActivityLogResponse>> getLogsByUser(@PathVariable UUID userId) {
        List<ActivityLogResponse> response = activityLogService.getLogsByUser(userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/user/{userId}/page")
    public ResponseEntity<Page<ActivityLogResponse>> getLogsByUserPaginated(
            @PathVariable UUID userId, Pageable pageable) {
        Page<ActivityLogResponse> response = activityLogService.getLogsByUser(userId, pageable);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/school/{schoolId}")
    public ResponseEntity<List<ActivityLogResponse>> getLogsBySchool(@PathVariable UUID schoolId) {
        List<ActivityLogResponse> response = activityLogService.getLogsBySchool(schoolId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/school/{schoolId}/page")
    public ResponseEntity<Page<ActivityLogResponse>> getLogsBySchoolPaginated(
            @PathVariable UUID schoolId, Pageable pageable) {
        Page<ActivityLogResponse> response = activityLogService.getLogsBySchool(schoolId, pageable);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/school/{schoolId}/action/{action}")
    public ResponseEntity<List<ActivityLogResponse>> getLogsByAction(
            @PathVariable UUID schoolId, @PathVariable LogAction action) {
        List<ActivityLogResponse> response = activityLogService.getLogsByAction(schoolId, action);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/school/{schoolId}/recent")
    public ResponseEntity<List<ActivityLogResponse>> getRecentLogs(
            @PathVariable UUID schoolId, @RequestParam(defaultValue = "10") int limit) {
        List<ActivityLogResponse> response = activityLogService.getRecentLogs(schoolId, limit);
        return ResponseEntity.ok(response);
    }
}

