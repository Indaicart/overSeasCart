package com.schoolms.service;

import com.schoolms.dto.auth.*;
import com.schoolms.entity.School;
import com.schoolms.entity.User;
import com.schoolms.exception.BadRequestException;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.exception.UnauthorizedException;
import com.schoolms.repository.SchoolRepository;
import com.schoolms.repository.UserRepository;
import com.schoolms.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    /**
     * Step 1: Validate school code for two-step login
     */
    public SchoolValidationResponse validateSchool(SchoolValidationRequest request) {
        log.info("Validating school code: {}", request.getSchoolCode());
        
        School school = schoolRepository.findBySchoolCode(request.getSchoolCode())
            .orElse(null);
        
        if (school == null) {
            return SchoolValidationResponse.builder()
                .valid(false)
                .message("Invalid school code")
                .build();
        }
        
        // Get available roles based on subscription plan
        // TODO: Implement subscription-based role filtering
        List<String> availableRoles = Arrays.asList("admin", "teacher", "student", "parent");
        
        return SchoolValidationResponse.builder()
            .valid(true)
            .schoolId(school.getId())
            .schoolName(school.getName())
            .availableRoles(availableRoles)
            .message("School found successfully")
            .build();
    }
    
    /**
     * Step 2: Login with email and password
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());
        
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        
        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            log.warn("Invalid password attempt for user: {}", request.getEmail());
            throw new UnauthorizedException("Invalid email or password");
        }
        
        // Check if user is active
        if (!user.getIsActive()) {
            throw new UnauthorizedException("Account is not active");
        }
        
        // If school code provided, verify user belongs to that school
        if (request.getSchoolCode() != null && !request.getSchoolCode().isEmpty()) {
            School school = schoolRepository.findBySchoolCode(request.getSchoolCode())
                .orElseThrow(() -> new BadRequestException("Invalid school code"));
            
            if (!school.getId().equals(user.getSchoolId())) {
                throw new UnauthorizedException("User does not belong to this school");
            }
        }
        
        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        
        // Generate JWT token
        String token = jwtUtil.generateToken(
            user.getId(),
            user.getEmail(),
            user.getRole().getValue(),
            user.getSchoolId()
        );
        
        // Get school name if applicable
        String schoolName = null;
        if (user.getSchoolId() != null) {
            School school = schoolRepository.findById(user.getSchoolId()).orElse(null);
            schoolName = school != null ? school.getName() : null;
        }
        
        log.info("Login successful for user: {}", user.getEmail());
        
        return AuthResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .userId(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .role(user.getRole())
            .schoolId(user.getSchoolId())
            .schoolName(schoolName)
            .permissions(user.getPermissions())
            .expiresIn(jwtUtil.getExpirationTime())
            .build();
    }
    
    /**
     * Register a new user
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registration attempt for email: {}", request.getEmail());
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        
        // Validate school if provided
        if (request.getSchoolId() != null) {
            schoolRepository.findById(request.getSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("School", "id", request.getSchoolId()));
        }
        
        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setGender(request.getGender());
        user.setSchoolId(request.getSchoolId());
        user.setIsActive(true);
        
        user = userRepository.save(user);
        
        log.info("User registered successfully: {}", user.getEmail());
        
        // Generate JWT token
        String token = jwtUtil.generateToken(
            user.getId(),
            user.getEmail(),
            user.getRole().getValue(),
            user.getSchoolId()
        );
        
        // Get school name if applicable
        String schoolName = null;
        if (user.getSchoolId() != null) {
            School school = schoolRepository.findById(user.getSchoolId()).orElse(null);
            schoolName = school != null ? school.getName() : null;
        }
        
        return AuthResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .userId(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .role(user.getRole())
            .schoolId(user.getSchoolId())
            .schoolName(schoolName)
            .permissions(user.getPermissions())
            .expiresIn(jwtUtil.getExpirationTime())
            .build();
    }
    
    /**
     * Validate JWT token
     */
    public boolean validateToken(String token, String username) {
        return jwtUtil.validateToken(token, username);
    }
}

