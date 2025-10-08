package com.schoolms.controller;

import com.schoolms.dto.user.ChangePasswordRequest;
import com.schoolms.dto.user.UserResponse;
import com.schoolms.dto.user.UserUpdateRequest;
import com.schoolms.enums.UserRole;
import com.schoolms.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class UserController {
    
    private final UserService userService;
    
    /**
     * Get user by ID
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        log.info("Get user request for ID: {}", id);
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get user by email
     * GET /api/users/email/{email}
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<UserResponse> getUserByEmail(@PathVariable String email) {
        log.info("Get user request for email: {}", email);
        UserResponse response = userService.getUserByEmail(email);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all users for a school
     * GET /api/users/school/{schoolId}
     */
    @GetMapping("/school/{schoolId}")
    public ResponseEntity<List<UserResponse>> getUsersBySchool(@PathVariable UUID schoolId) {
        log.info("Get users request for school: {}", schoolId);
        List<UserResponse> response = userService.getUsersBySchool(schoolId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get users by school with pagination
     * GET /api/users/school/{schoolId}/page
     */
    @GetMapping("/school/{schoolId}/page")
    public ResponseEntity<Page<UserResponse>> getUsersBySchoolPaginated(
            @PathVariable UUID schoolId,
            Pageable pageable) {
        log.info("Get users request for school: {} with pagination", schoolId);
        Page<UserResponse> response = userService.getUsersBySchool(schoolId, pageable);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get users by school and role
     * GET /api/users/school/{schoolId}/role/{role}
     */
    @GetMapping("/school/{schoolId}/role/{role}")
    public ResponseEntity<List<UserResponse>> getUsersBySchoolAndRole(
            @PathVariable UUID schoolId,
            @PathVariable UserRole role) {
        log.info("Get users request for school: {} with role: {}", schoolId, role);
        List<UserResponse> response = userService.getUsersBySchoolAndRole(schoolId, role);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get users by school and role with pagination
     * GET /api/users/school/{schoolId}/role/{role}/page
     */
    @GetMapping("/school/{schoolId}/role/{role}/page")
    public ResponseEntity<Page<UserResponse>> getUsersBySchoolAndRolePaginated(
            @PathVariable UUID schoolId,
            @PathVariable UserRole role,
            Pageable pageable) {
        log.info("Get users request for school: {} with role: {} with pagination", schoolId, role);
        Page<UserResponse> response = userService.getUsersBySchoolAndRole(schoolId, role, pageable);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Update user
     * PUT /api/users/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UserUpdateRequest request) {
        log.info("Update user request for ID: {}", id);
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Change password
     * POST /api/users/{id}/change-password
     */
    @PostMapping("/{id}/change-password")
    public ResponseEntity<Void> changePassword(
            @PathVariable UUID id,
            @Valid @RequestBody ChangePasswordRequest request) {
        log.info("Change password request for user: {}", id);
        userService.changePassword(id, request);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Deactivate user
     * POST /api/users/{id}/deactivate
     */
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateUser(@PathVariable UUID id) {
        log.info("Deactivate user request for ID: {}", id);
        userService.deactivateUser(id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Activate user
     * POST /api/users/{id}/activate
     */
    @PostMapping("/{id}/activate")
    public ResponseEntity<Void> activateUser(@PathVariable UUID id) {
        log.info("Activate user request for ID: {}", id);
        userService.activateUser(id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Delete user
     * DELETE /api/users/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        log.info("Delete user request for ID: {}", id);
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get user count by school
     * GET /api/users/school/{schoolId}/count
     */
    @GetMapping("/school/{schoolId}/count")
    public ResponseEntity<Long> getUserCountBySchool(@PathVariable UUID schoolId) {
        log.info("Get user count for school: {}", schoolId);
        long count = userService.getUserCountBySchool(schoolId);
        return ResponseEntity.ok(count);
    }
    
    /**
     * Get user count by school and role
     * GET /api/users/school/{schoolId}/role/{role}/count
     */
    @GetMapping("/school/{schoolId}/role/{role}/count")
    public ResponseEntity<Long> getUserCountBySchoolAndRole(
            @PathVariable UUID schoolId,
            @PathVariable UserRole role) {
        log.info("Get user count for school: {} with role: {}", schoolId, role);
        long count = userService.getUserCountBySchoolAndRole(schoolId, role);
        return ResponseEntity.ok(count);
    }
}

