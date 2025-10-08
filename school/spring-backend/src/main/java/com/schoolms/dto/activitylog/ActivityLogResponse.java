package com.schoolms.dto.activitylog;

import com.schoolms.enums.LogAction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogResponse {
    
    private UUID id;
    private UUID userId;
    private String userName;
    private String userEmail;
    private LogAction action;
    private String entityType;
    private UUID entityId;
    private String description;
    private String ipAddress;
    private String userAgent;
    private String metadata;
    private UUID schoolId;
    
    private LocalDateTime createdAt;
}

