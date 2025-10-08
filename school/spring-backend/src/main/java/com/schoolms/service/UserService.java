package com.schoolms.service;

import com.schoolms.dto.user.ChangePasswordRequest;
import com.schoolms.dto.user.UserResponse;
import com.schoolms.dto.user.UserUpdateRequest;
import com.schoolms.entity.School;
import com.schoolms.entity.User;
import com.schoolms.enums.UserRole;
import com.schoolms.exception.BadRequestException;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.exception.UnauthorizedException;
import com.schoolms.repository.SchoolRepository;
import com.schoolms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    
    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;
    
    /**
     * Get user by ID
     */
    public UserResponse getUserById(UUID userId) {
        log.info("Fetching user by ID: {}", userId);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return mapToResponse(user);
    }
    
    /**
     * Get user by email
     */
    public UserResponse getUserByEmail(String email) {
        log.info("Fetching user by email: {}", email);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return mapToResponse(user);
    }
    
    /**
     * Get all users for a school
     */
    public List<UserResponse> getUsersBySchool(UUID schoolId) {
        log.info("Fetching users for school: {}", schoolId);
        List<User> users = userRepository.findBySchoolId(schoolId);
        return users.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get users by school with pagination
     */
    public Page<UserResponse> getUsersBySchool(UUID schoolId, Pageable pageable) {
        log.info("Fetching users for school: {} with pagination", schoolId);
        Page<User> users = userRepository.findBySchoolId(schoolId, pageable);
        return users.map(this::mapToResponse);
    }
    
    /**
     * Get users by school and role
     */
    public List<UserResponse> getUsersBySchoolAndRole(UUID schoolId, UserRole role) {
        log.info("Fetching users for school: {} with role: {}", schoolId, role);
        List<User> users = userRepository.findBySchoolIdAndRole(schoolId, role);
        return users.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get users by school and role with pagination
     */
    public Page<UserResponse> getUsersBySchoolAndRole(UUID schoolId, UserRole role, Pageable pageable) {
        log.info("Fetching users for school: {} with role: {} with pagination", schoolId, role);
        Page<User> users = userRepository.findBySchoolIdAndRole(schoolId, role, pageable);
        return users.map(this::mapToResponse);
    }
    
    /**
     * Update user
     */
    @Transactional
    public UserResponse updateUser(UUID userId, UserUpdateRequest request) {
        log.info("Updating user: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Check if email is being changed and if it's already taken
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already in use");
            }
            user.setEmail(request.getEmail());
        }
        
        // Update fields if provided
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }
        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }
        if (request.getPermissions() != null) {
            user.setPermissions(request.getPermissions());
        }
        
        user = userRepository.save(user);
        log.info("User updated successfully: {}", userId);
        
        return mapToResponse(user);
    }
    
    /**
     * Change password
     */
    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        log.info("Changing password for user: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Current password is incorrect");
        }
        
        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        log.info("Password changed successfully for user: {}", userId);
    }
    
    /**
     * Deactivate user
     */
    @Transactional
    public void deactivateUser(UUID userId) {
        log.info("Deactivating user: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        user.setIsActive(false);
        userRepository.save(user);
        
        log.info("User deactivated successfully: {}", userId);
    }
    
    /**
     * Activate user
     */
    @Transactional
    public void activateUser(UUID userId) {
        log.info("Activating user: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        user.setIsActive(true);
        userRepository.save(user);
        
        log.info("User activated successfully: {}", userId);
    }
    
    /**
     * Delete user
     */
    @Transactional
    public void deleteUser(UUID userId) {
        log.info("Deleting user: {}", userId);
        
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        
        userRepository.deleteById(userId);
        log.info("User deleted successfully: {}", userId);
    }
    
    /**
     * Get user count by school
     */
    public long getUserCountBySchool(UUID schoolId) {
        return userRepository.countBySchoolId(schoolId);
    }
    
    /**
     * Get user count by school and role
     */
    public long getUserCountBySchoolAndRole(UUID schoolId, UserRole role) {
        return userRepository.countBySchoolIdAndRole(schoolId, role);
    }
    
    /**
     * Map User entity to UserResponse DTO
     */
    private UserResponse mapToResponse(User user) {
        UserResponse response = modelMapper.map(user, UserResponse.class);
        response.setFullName(user.getFullName());
        
        // Get school name if applicable
        if (user.getSchoolId() != null) {
            School school = schoolRepository.findById(user.getSchoolId()).orElse(null);
            if (school != null) {
                response.setSchoolName(school.getName());
            }
        }
        
        return response;
    }
}
