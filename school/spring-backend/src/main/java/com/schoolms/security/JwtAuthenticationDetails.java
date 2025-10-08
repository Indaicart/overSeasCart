package com.schoolms.security;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

/**
 * Custom authentication details to store JWT payload information
 * Can be accessed from SecurityContext to get current user details
 */
@Data
@AllArgsConstructor
public class JwtAuthenticationDetails {
    private UUID userId;
    private String email;
    private String role;
    private UUID schoolId; // Null for Super Admin
}

