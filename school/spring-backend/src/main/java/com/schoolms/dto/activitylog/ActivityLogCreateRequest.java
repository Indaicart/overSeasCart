package com.schoolms.dto.activitylog;

import com.schoolms.enums.LogAction;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogCreateRequest {
    
    @NotNull(message = "User ID is required")
    private UUID userId;
    
    @NotNull(message = "Action is required")
    private LogAction action;
    
    @NotBlank(message = "Entity type is required")
    private String entityType;
    
    private UUID entityId;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    private String ipAddress;
    private String userAgent;
    private String metadata;
    
    @NotNull(message = "School ID is required")
    private UUID schoolId;
}

