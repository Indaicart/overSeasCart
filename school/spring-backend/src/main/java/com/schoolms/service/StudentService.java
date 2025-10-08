package com.schoolms.service;

import com.schoolms.dto.student.StudentCreateRequest;
import com.schoolms.dto.student.StudentResponse;
import com.schoolms.dto.student.StudentUpdateRequest;
import com.schoolms.entity.Class;
import com.schoolms.entity.School;
import com.schoolms.entity.Student;
import com.schoolms.entity.User;
import com.schoolms.enums.StudentStatus;
import com.schoolms.enums.UserRole;
import com.schoolms.exception.BadRequestException;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.repository.ClassRepository;
import com.schoolms.repository.SchoolRepository;
import com.schoolms.repository.StudentRepository;
import com.schoolms.repository.UserRepository;
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
public class StudentService {
    
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final ClassRepository classRepository;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * Create new student
     */
    @Transactional
    public StudentResponse createStudent(StudentCreateRequest request) {
        log.info("Creating new student with email: {}", request.getEmail());
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        
        // Check if student ID already exists
        if (studentRepository.existsByStudentId(request.getStudentId())) {
            throw new BadRequestException("Student ID already exists");
        }
        
        // Check if admission number already exists (if provided)
        if (request.getAdmissionNumber() != null && 
            studentRepository.existsByAdmissionNumber(request.getAdmissionNumber())) {
            throw new BadRequestException("Admission number already exists");
        }
        
        // Validate school exists
        School school = schoolRepository.findById(request.getSchoolId())
            .orElseThrow(() -> new ResourceNotFoundException("School", "id", request.getSchoolId()));
        
        // Validate class exists (if provided)
        if (request.getClassId() != null) {
            classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", request.getClassId()));
        }
        
        // Create User first
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.STUDENT);
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
        
        // Create Student
        Student student = new Student();
        student.setUserId(user.getId());
        student.setStudentId(request.getStudentId());
        student.setAdmissionNumber(request.getAdmissionNumber());
        student.setAdmissionDate(request.getAdmissionDate());
        student.setStatus(request.getStatus() != null ? request.getStatus() : StudentStatus.ACTIVE);
        student.setClassId(request.getClassId());
        student.setSection(request.getSection());
        student.setRollNumber(request.getRollNumber());
        student.setBloodGroup(request.getBloodGroup());
        student.setMedicalConditions(request.getMedicalConditions());
        student.setEmergencyContactName(request.getEmergencyContactName());
        student.setEmergencyContactPhone(request.getEmergencyContactPhone());
        student.setNotes(request.getNotes());
        student.setSchoolId(request.getSchoolId());
        
        student = studentRepository.save(student);
        
        log.info("Student created successfully with ID: {}", student.getId());
        return mapToResponse(student, user);
    }
    
    /**
     * Get student by ID
     */
    public StudentResponse getStudentById(UUID id) {
        log.info("Fetching student by ID: {}", id);
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        
        User user = userRepository.findById(student.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", student.getUserId()));
        
        return mapToResponse(student, user);
    }
    
    /**
     * Get student by student ID
     */
    public StudentResponse getStudentByStudentId(String studentId) {
        log.info("Fetching student by student ID: {}", studentId);
        Student student = studentRepository.findByStudentId(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student", "studentId", studentId));
        
        User user = userRepository.findById(student.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", student.getUserId()));
        
        return mapToResponse(student, user);
    }
    
    /**
     * Get all students for a school
     */
    public List<StudentResponse> getStudentsBySchool(UUID schoolId) {
        log.info("Fetching students for school: {}", schoolId);
        List<Student> students = studentRepository.findBySchoolId(schoolId);
        return students.stream()
            .map(this::mapToResponseWithUser)
            .collect(Collectors.toList());
    }
    
    /**
     * Get students by school with pagination
     */
    public Page<StudentResponse> getStudentsBySchool(UUID schoolId, Pageable pageable) {
        log.info("Fetching students for school: {} with pagination", schoolId);
        Page<Student> students = studentRepository.findBySchoolId(schoolId, pageable);
        return students.map(this::mapToResponseWithUser);
    }
    
    /**
     * Get students by class
     */
    public List<StudentResponse> getStudentsByClass(UUID classId) {
        log.info("Fetching students for class: {}", classId);
        List<Student> students = studentRepository.findByClassId(classId);
        return students.stream()
            .map(this::mapToResponseWithUser)
            .collect(Collectors.toList());
    }
    
    /**
     * Get students by class with pagination
     */
    public Page<StudentResponse> getStudentsByClass(UUID classId, Pageable pageable) {
        log.info("Fetching students for class: {} with pagination", classId);
        Page<Student> students = studentRepository.findByClassId(classId, pageable);
        return students.map(this::mapToResponseWithUser);
    }
    
    /**
     * Get students by status
     */
    public List<StudentResponse> getStudentsByStatus(UUID schoolId, StudentStatus status) {
        log.info("Fetching students for school: {} with status: {}", schoolId, status);
        List<Student> students = studentRepository.findBySchoolIdAndStatus(schoolId, status);
        return students.stream()
            .map(this::mapToResponseWithUser)
            .collect(Collectors.toList());
    }
    
    /**
     * Update student
     */
    @Transactional
    public StudentResponse updateStudent(UUID id, StudentUpdateRequest request) {
        log.info("Updating student: {}", id);
        
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        
        User user = userRepository.findById(student.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", student.getUserId()));
        
        // Update user fields if provided
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
        
        // Update student fields if provided
        if (request.getStatus() != null) student.setStatus(request.getStatus());
        if (request.getClassId() != null) {
            classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", request.getClassId()));
            student.setClassId(request.getClassId());
        }
        if (request.getSection() != null) student.setSection(request.getSection());
        if (request.getRollNumber() != null) student.setRollNumber(request.getRollNumber());
        if (request.getBloodGroup() != null) student.setBloodGroup(request.getBloodGroup());
        if (request.getMedicalConditions() != null) student.setMedicalConditions(request.getMedicalConditions());
        if (request.getEmergencyContactName() != null) student.setEmergencyContactName(request.getEmergencyContactName());
        if (request.getEmergencyContactPhone() != null) student.setEmergencyContactPhone(request.getEmergencyContactPhone());
        if (request.getNotes() != null) student.setNotes(request.getNotes());
        
        student = studentRepository.save(student);
        
        log.info("Student updated successfully: {}", id);
        return mapToResponse(student, user);
    }
    
    /**
     * Delete student
     */
    @Transactional
    public void deleteStudent(UUID id) {
        log.info("Deleting student: {}", id);
        
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        
        // Delete user (will cascade delete student due to foreign key)
        userRepository.deleteById(student.getUserId());
        
        log.info("Student deleted successfully: {}", id);
    }
    
    /**
     * Get student count by school
     */
    public long getStudentCountBySchool(UUID schoolId) {
        return studentRepository.countBySchoolId(schoolId);
    }
    
    /**
     * Get student count by class
     */
    public long getStudentCountByClass(UUID classId) {
        return studentRepository.countByClassId(classId);
    }
    
    /**
     * Map Student entity to StudentResponse DTO
     */
    private StudentResponse mapToResponse(Student student, User user) {
        StudentResponse response = StudentResponse.builder()
            .id(student.getId())
            .userId(user.getId())
            .studentId(student.getStudentId())
            .admissionNumber(student.getAdmissionNumber())
            .admissionDate(student.getAdmissionDate())
            .status(student.getStatus())
            .classId(student.getClassId())
            .section(student.getSection())
            .rollNumber(student.getRollNumber())
            .bloodGroup(student.getBloodGroup())
            .medicalConditions(student.getMedicalConditions())
            .emergencyContactName(student.getEmergencyContactName())
            .emergencyContactPhone(student.getEmergencyContactPhone())
            .notes(student.getNotes())
            .schoolId(student.getSchoolId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .fullName(user.getFullName())
            .phone(user.getPhone())
            .address(user.getAddress())
            .dateOfBirth(user.getDateOfBirth())
            .gender(user.getGender() != null ? user.getGender().getValue() : null)
            .profileImage(user.getProfileImage())
            .createdAt(student.getCreatedAt())
            .updatedAt(student.getUpdatedAt())
            .build();
        
        // Get class name if applicable
        if (student.getClassId() != null) {
            Class studentClass = classRepository.findById(student.getClassId()).orElse(null);
            if (studentClass != null) {
                response.setClassName(studentClass.getName());
            }
        }
        
        // Get school name
        if (student.getSchoolId() != null) {
            School school = schoolRepository.findById(student.getSchoolId()).orElse(null);
            if (school != null) {
                response.setSchoolName(school.getName());
            }
        }
        
        return response;
    }
    
    /**
     * Helper method to map with user fetch
     */
    private StudentResponse mapToResponseWithUser(Student student) {
        User user = userRepository.findById(student.getUserId()).orElse(null);
        if (user == null) {
            throw new ResourceNotFoundException("User", "id", student.getUserId());
        }
        return mapToResponse(student, user);
    }
}

