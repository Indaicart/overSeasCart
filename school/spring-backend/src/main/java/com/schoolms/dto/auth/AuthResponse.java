package com.schoolms.dto.auth;

import com.schoolms.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    
    private String token;
    private String tokenType = "Bearer";
    private UUID userId;
    private String email;
    private String fullName;
    private UserRole role;
    private UUID schoolId;
    private String schoolName;
    private Map<String, Object> permissions;
    private Long expiresIn; // in seconds
}

