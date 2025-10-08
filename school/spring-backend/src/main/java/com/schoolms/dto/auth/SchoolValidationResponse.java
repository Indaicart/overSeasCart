package com.schoolms.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchoolValidationResponse {
    
    private boolean valid;
    private UUID schoolId;
    private String schoolName;
    private List<String> availableRoles; // Based on subscription plan
    private String message;
}

