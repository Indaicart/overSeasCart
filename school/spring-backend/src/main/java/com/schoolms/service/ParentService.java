package com.schoolms.service;

import com.schoolms.dto.parent.ParentCreateRequest;
import com.schoolms.dto.parent.ParentResponse;
import com.schoolms.dto.parent.ParentUpdateRequest;
import com.schoolms.dto.parent.StudentParentLinkRequest;
import com.schoolms.entity.*;
import com.schoolms.enums.UserRole;
import com.schoolms.exception.BadRequestException;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
public class ParentService {
    
    private final ParentRepository parentRepository;
    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final StudentParentRepository studentParentRepository;
    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Transactional
    public ParentResponse createParent(ParentCreateRequest request) {
        log.info("Creating parent: {}", request.getEmail());
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        
        schoolRepository.findById(request.getSchoolId())
            .orElseThrow(() -> new ResourceNotFoundException("School", "id", request.getSchoolId()));
        
        // Create User
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.PARENT);
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setGender(request.getGender());
        user.setProfileImage(request.getProfileImage());
        user.setSchoolId(request.getSchoolId());
        user.setIsActive(true);
        
        user = userRepository.save(user);
        
        // Create Parent
        Parent parent = new Parent();
        parent.setUserId(user.getId());
        parent.setOccupation(request.getOccupation());
        parent.setAnnualIncome(request.getAnnualIncome());
        parent.setEmergencyContactName(request.getEmergencyContactName());
        parent.setEmergencyContactPhone(request.getEmergencyContactPhone());
        parent.setEmergencyContactRelation(request.getEmergencyContactRelation());
        parent.setSchoolId(request.getSchoolId());
        
        parent = parentRepository.save(parent);
        log.info("Parent created with ID: {}", parent.getId());
        return mapToResponse(parent, user);
    }
    
    public ParentResponse getParentById(UUID id) {
        log.info("Fetching parent by ID: {}", id);
        Parent parent = parentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Parent", "id", id));
        
        User user = userRepository.findById(parent.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", parent.getUserId()));
        
        return mapToResponse(parent, user);
    }
    
    public List<ParentResponse> getParentsBySchool(UUID schoolId) {
        log.info("Fetching parents for school: {}", schoolId);
        List<Parent> parents = parentRepository.findBySchoolId(schoolId);
        return parents.stream().map(this::mapToResponseWithUser).collect(Collectors.toList());
    }
    
    public Page<ParentResponse> getParentsBySchool(UUID schoolId, Pageable pageable) {
        log.info("Fetching parents for school: {} with pagination", schoolId);
        Page<Parent> parents = parentRepository.findBySchoolId(schoolId, pageable);
        return parents.map(this::mapToResponseWithUser);
    }
    
    public List<ParentResponse> getParentsByStudent(UUID studentId) {
        log.info("Fetching parents for student: {}", studentId);
        List<StudentParent> links = studentParentRepository.findByStudentId(studentId);
        return links.stream()
            .map(link -> {
                Parent parent = parentRepository.findById(link.getParentId()).orElse(null);
                return parent != null ? mapToResponseWithUser(parent) : null;
            })
            .filter(response -> response != null)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public ParentResponse updateParent(UUID id, ParentUpdateRequest request) {
        log.info("Updating parent: {}", id);
        
        Parent parent = parentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Parent", "id", id));
        
        User user = userRepository.findById(parent.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", parent.getUserId()));
        
        // Update user fields
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already in use");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getProfileImage() != null) user.setProfileImage(request.getProfileImage());
        
        userRepository.save(user);
        
        // Update parent fields
        if (request.getOccupation() != null) parent.setOccupation(request.getOccupation());
        if (request.getAnnualIncome() != null) parent.setAnnualIncome(request.getAnnualIncome());
        if (request.getEmergencyContactName() != null) parent.setEmergencyContactName(request.getEmergencyContactName());
        if (request.getEmergencyContactPhone() != null) parent.setEmergencyContactPhone(request.getEmergencyContactPhone());
        if (request.getEmergencyContactRelation() != null) parent.setEmergencyContactRelation(request.getEmergencyContactRelation());
        
        parent = parentRepository.save(parent);
        log.info("Parent updated successfully: {}", id);
        return mapToResponse(parent, user);
    }
    
    @Transactional
    public void deleteParent(UUID id) {
        log.info("Deleting parent: {}", id);
        Parent parent = parentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Parent", "id", id));
        
        // Delete all student-parent relationships
        studentParentRepository.deleteByParentId(id);
        
        // Delete user
        userRepository.deleteById(parent.getUserId());
        log.info("Parent deleted successfully: {}", id);
    }
    
    @Transactional
    public void linkStudentToParent(StudentParentLinkRequest request) {
        log.info("Linking student {} to parent {}", request.getStudentId(), request.getParentId());
        
        studentRepository.findById(request.getStudentId())
            .orElseThrow(() -> new ResourceNotFoundException("Student", "id", request.getStudentId()));
        
        parentRepository.findById(request.getParentId())
            .orElseThrow(() -> new ResourceNotFoundException("Parent", "id", request.getParentId()));
        
        // Check if link already exists
        if (studentParentRepository.existsByStudentIdAndParentId(request.getStudentId(), request.getParentId())) {
            throw new BadRequestException("This student is already linked to this parent");
        }
        
        StudentParent link = new StudentParent();
        link.setStudentId(request.getStudentId());
        link.setParentId(request.getParentId());
        link.setRelationshipType(request.getRelationshipType());
        link.setIsPrimaryGuardian(request.getIsPrimaryGuardian() != null ? request.getIsPrimaryGuardian() : false);
        
        studentParentRepository.save(link);
        log.info("Student linked to parent successfully");
    }
    
    @Transactional
    public void unlinkStudentFromParent(UUID studentId, UUID parentId) {
        log.info("Unlinking student {} from parent {}", studentId, parentId);
        studentParentRepository.deleteByStudentIdAndParentId(studentId, parentId);
        log.info("Student unlinked from parent successfully");
    }
    
    public long getParentCountBySchool(UUID schoolId) {
        return parentRepository.countBySchoolId(schoolId);
    }
    
    private ParentResponse mapToResponse(Parent parent, User user) {
        ParentResponse response = ParentResponse.builder()
            .id(parent.getId())
            .userId(user.getId())
            .occupation(parent.getOccupation())
            .annualIncome(parent.getAnnualIncome())
            .emergencyContactName(parent.getEmergencyContactName())
            .emergencyContactPhone(parent.getEmergencyContactPhone())
            .emergencyContactRelation(parent.getEmergencyContactRelation())
            .schoolId(parent.getSchoolId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .fullName(user.getFullName())
            .phone(user.getPhone())
            .address(user.getAddress())
            .dateOfBirth(user.getDateOfBirth())
            .gender(user.getGender() != null ? user.getGender().getValue() : null)
            .profileImage(user.getProfileImage())
            .createdAt(parent.getCreatedAt())
            .updatedAt(parent.getUpdatedAt())
            .build();
        
        // Get school name
        School school = schoolRepository.findById(parent.getSchoolId()).orElse(null);
        if (school != null) response.setSchoolName(school.getName());
        
        // Get children
        List<StudentParent> links = studentParentRepository.findByParentId(parent.getId());
        List<ParentResponse.ChildInfo> children = links.stream()
            .map(link -> {
                Student student = studentRepository.findById(link.getStudentId()).orElse(null);
                if (student == null) return null;
                
                User studentUser = userRepository.findById(student.getUserId()).orElse(null);
                String className = null;
                if (student.getClassId() != null) {
                    Class studentClass = classRepository.findById(student.getClassId()).orElse(null);
                    if (studentClass != null) className = studentClass.getName();
                }
                
                return ParentResponse.ChildInfo.builder()
                    .studentId(student.getId())
                    .studentName(studentUser != null ? studentUser.getFullName() : null)
                    .studentIdNumber(student.getStudentId())
                    .className(className)
                    .relationship(link.getRelationshipType())
                    .isPrimaryGuardian(link.getIsPrimaryGuardian())
                    .build();
            })
            .filter(child -> child != null)
            .collect(Collectors.toList());
        
        response.setChildren(children);
        
        return response;
    }
    
    private ParentResponse mapToResponseWithUser(Parent parent) {
        User user = userRepository.findById(parent.getUserId()).orElse(null);
        if (user == null) {
            throw new ResourceNotFoundException("User", "id", parent.getUserId());
        }
        return mapToResponse(parent, user);
    }
}

