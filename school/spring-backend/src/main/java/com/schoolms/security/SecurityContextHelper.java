package com.schoolms.security;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Helper class to extract current user information from SecurityContext
 * Provides convenience methods to get userId, schoolId, role, email
 */
@Component
public class SecurityContextHelper {
    
    /**
     * Get current authenticated user's details
     */
    public JwtAuthenticationDetails getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated() 
                && authentication instanceof UsernamePasswordAuthenticationToken) {
            Object details = authentication.getDetails();
            
            if (details instanceof JwtAuthenticationDetails) {
                return (JwtAuthenticationDetails) details;
            }
        }
        
        return null;
    }
    
    /**
     * Get current user's ID
     */
    public UUID getCurrentUserId() {
        JwtAuthenticationDetails user = getCurrentUser();
        return user != null ? user.getUserId() : null;
    }
    
    /**
     * Get current user's email
     */
    public String getCurrentUserEmail() {
        JwtAuthenticationDetails user = getCurrentUser();
        return user != null ? user.getEmail() : null;
    }
    
    /**
     * Get current user's role
     */
    public String getCurrentUserRole() {
        JwtAuthenticationDetails user = getCurrentUser();
        return user != null ? user.getRole() : null;
    }
    
    /**
     * Get current user's school ID
     */
    public UUID getCurrentSchoolId() {
        JwtAuthenticationDetails user = getCurrentUser();
        return user != null ? user.getSchoolId() : null;
    }
    
    /**
     * Check if current user has a specific role
     */
    public boolean hasRole(String role) {
        String currentRole = getCurrentUserRole();
        return currentRole != null && currentRole.equalsIgnoreCase(role);
    }
    
    /**
     * Check if current user is Super Admin
     */
    public boolean isSuperAdmin() {
        return hasRole("SUPER_ADMIN");
    }
    
    /**
     * Check if current user is School Admin
     */
    public boolean isSchoolAdmin() {
        return hasRole("SCHOOL_ADMIN");
    }
    
    /**
     * Check if current user is a Teacher (Class Teacher or Subject Teacher)
     */
    public boolean isTeacher() {
        String role = getCurrentUserRole();
        return role != null && (role.equals("CLASS_TEACHER") || role.equals("SUBJECT_TEACHER"));
    }
    
    /**
     * Check if current user is a Parent
     */
    public boolean isParent() {
        return hasRole("PARENT");
    }
    
    /**
     * Check if current user is a Student
     */
    public boolean isStudent() {
        return hasRole("STUDENT");
    }
}

