package com.schoolms.service;

import com.schoolms.dto.activitylog.ActivityLogCreateRequest;
import com.schoolms.dto.activitylog.ActivityLogResponse;
import com.schoolms.entity.ActivityLog;
import com.schoolms.entity.User;
import com.schoolms.enums.LogAction;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.repository.ActivityLogRepository;
import com.schoolms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityLogService {
    
    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public ActivityLogResponse createLog(ActivityLogCreateRequest request) {
        log.debug("Creating activity log for user: {}", request.getUserId());
        
        ActivityLog activityLog = new ActivityLog();
        activityLog.setUserId(request.getUserId());
        activityLog.setAction(request.getAction());
        activityLog.setEntityType(request.getEntityType());
        activityLog.setEntityId(request.getEntityId());
        activityLog.setDescription(request.getDescription());
        activityLog.setIpAddress(request.getIpAddress());
        activityLog.setUserAgent(request.getUserAgent());
        activityLog.setMetadata(request.getMetadata());
        activityLog.setSchoolId(request.getSchoolId());
        
        activityLog = activityLogRepository.save(activityLog);
        return mapToResponse(activityLog);
    }
    
    public ActivityLogResponse getLogById(UUID id) {
        ActivityLog activityLog = activityLogRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("ActivityLog", "id", id));
        return mapToResponse(activityLog);
    }
    
    public List<ActivityLogResponse> getLogsByUser(UUID userId) {
        List<ActivityLog> logs = activityLogRepository.findByUserId(userId);
        return logs.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    public Page<ActivityLogResponse> getLogsByUser(UUID userId, Pageable pageable) {
        Page<ActivityLog> logs = activityLogRepository.findByUserId(userId, pageable);
        return logs.map(this::mapToResponse);
    }
    
    public List<ActivityLogResponse> getLogsBySchool(UUID schoolId) {
        List<ActivityLog> logs = activityLogRepository.findBySchoolId(schoolId);
        return logs.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    public Page<ActivityLogResponse> getLogsBySchool(UUID schoolId, Pageable pageable) {
        Page<ActivityLog> logs = activityLogRepository.findBySchoolId(schoolId, pageable);
        return logs.map(this::mapToResponse);
    }
    
    public List<ActivityLogResponse> getLogsByAction(UUID schoolId, LogAction action) {
        List<ActivityLog> logs = activityLogRepository.findBySchoolIdAndAction(schoolId, action);
        return logs.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    public List<ActivityLogResponse> getRecentLogs(UUID schoolId, int limit) {
        List<ActivityLog> logs = activityLogRepository.findBySchoolIdOrderByCreatedAtDesc(schoolId);
        return logs.stream()
            .limit(limit)
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    private ActivityLogResponse mapToResponse(ActivityLog activityLog) {
        ActivityLogResponse response = ActivityLogResponse.builder()
            .id(activityLog.getId())
            .userId(activityLog.getUserId())
            .action(activityLog.getAction())
            .entityType(activityLog.getEntityType())
            .entityId(activityLog.getEntityId())
            .description(activityLog.getDescription())
            .ipAddress(activityLog.getIpAddress())
            .userAgent(activityLog.getUserAgent())
            .metadata(activityLog.getMetadata())
            .schoolId(activityLog.getSchoolId())
            .createdAt(activityLog.getCreatedAt())
            .build();
        
        User user = userRepository.findById(activityLog.getUserId()).orElse(null);
        if (user != null) {
            response.setUserName(user.getFullName());
            response.setUserEmail(user.getEmail());
        }
        
        return response;
    }
}

