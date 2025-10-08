package com.schoolms.service;

import com.schoolms.dto.teacher.TeacherCreateRequest;
import com.schoolms.dto.teacher.TeacherResponse;
import com.schoolms.dto.teacher.TeacherUpdateRequest;
import com.schoolms.entity.Class;
import com.schoolms.entity.School;
import com.schoolms.entity.Subject;
import com.schoolms.entity.Teacher;
import com.schoolms.entity.User;
import com.schoolms.enums.TeacherStatus;
import com.schoolms.enums.UserRole;
import com.schoolms.exception.BadRequestException;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.repository.ClassRepository;
import com.schoolms.repository.SchoolRepository;
import com.schoolms.repository.SubjectRepository;
import com.schoolms.repository.TeacherRepository;
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
public class TeacherService {
    
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final ClassRepository classRepository;
    private final SubjectRepository subjectRepository;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * Create new teacher
     */
    @Transactional
    public TeacherResponse createTeacher(TeacherCreateRequest request) {
        log.info("Creating new teacher with email: {}", request.getEmail());
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        
        // Check if employee ID already exists
        if (teacherRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new BadRequestException("Employee ID already exists");
        }
        
        // Validate school exists
        School school = schoolRepository.findById(request.getSchoolId())
            .orElseThrow(() -> new ResourceNotFoundException("School", "id", request.getSchoolId()));
        
        // Validate class exists (if teacher is class teacher)
        if (request.getIsClassTeacher() != null && request.getIsClassTeacher() && request.getClassTeacherId() != null) {
            classRepository.findById(request.getClassTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", request.getClassTeacherId()));
        }
        
        // Validate subjects exist (if provided)
        if (request.getSubjectIds() != null && !request.getSubjectIds().isEmpty()) {
            for (UUID subjectId : request.getSubjectIds()) {
                subjectRepository.findById(subjectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", subjectId));
            }
        }
        
        // Create User first
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.TEACHER);
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
        
        // Create Teacher
        Teacher teacher = new Teacher();
        teacher.setUserId(user.getId());
        teacher.setEmployeeId(request.getEmployeeId());
        teacher.setJoiningDate(request.getJoiningDate());
        teacher.setQualification(request.getQualification());
        teacher.setExperience(request.getExperience());
        teacher.setSpecialization(request.getSpecialization());
        teacher.setStatus(request.getStatus() != null ? request.getStatus() : TeacherStatus.ACTIVE);
        teacher.setIsClassTeacher(request.getIsClassTeacher() != null ? request.getIsClassTeacher() : false);
        teacher.setClassTeacherId(request.getClassTeacherId());
        
        // Set subjects as CSV (comma-separated UUIDs)
        if (request.getSubjectIds() != null && !request.getSubjectIds().isEmpty()) {
            String subjectsCSV = request.getSubjectIds().stream()
                .map(UUID::toString)
                .collect(Collectors.joining(","));
            teacher.setSubjectsCSV(subjectsCSV);
        }
        
        teacher.setSchoolId(request.getSchoolId());
        
        teacher = teacherRepository.save(teacher);
        
        log.info("Teacher created successfully with ID: {}", teacher.getId());
        return mapToResponse(teacher, user);
    }
    
    /**
     * Get teacher by ID
     */
    public TeacherResponse getTeacherById(UUID id) {
        log.info("Fetching teacher by ID: {}", id);
        Teacher teacher = teacherRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", id));
        
        User user = userRepository.findById(teacher.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", teacher.getUserId()));
        
        return mapToResponse(teacher, user);
    }
    
    /**
     * Get teacher by employee ID
     */
    public TeacherResponse getTeacherByEmployeeId(String employeeId) {
        log.info("Fetching teacher by employee ID: {}", employeeId);
        Teacher teacher = teacherRepository.findByEmployeeId(employeeId)
            .orElseThrow(() -> new ResourceNotFoundException("Teacher", "employeeId", employeeId));
        
        User user = userRepository.findById(teacher.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", teacher.getUserId()));
        
        return mapToResponse(teacher, user);
    }
    
    /**
     * Get all teachers for a school
     */
    public List<TeacherResponse> getTeachersBySchool(UUID schoolId) {
        log.info("Fetching teachers for school: {}", schoolId);
        List<Teacher> teachers = teacherRepository.findBySchoolId(schoolId);
        return teachers.stream()
            .map(this::mapToResponseWithUser)
            .collect(Collectors.toList());
    }
    
    /**
     * Get teachers by school with pagination
     */
    public Page<TeacherResponse> getTeachersBySchool(UUID schoolId, Pageable pageable) {
        log.info("Fetching teachers for school: {} with pagination", schoolId);
        Page<Teacher> teachers = teacherRepository.findBySchoolId(schoolId, pageable);
        return teachers.map(this::mapToResponseWithUser);
    }
    
    /**
     * Get class teachers by school
     */
    public List<TeacherResponse> getClassTeachers(UUID schoolId) {
        log.info("Fetching class teachers for school: {}", schoolId);
        List<Teacher> teachers = teacherRepository.findBySchoolIdAndIsClassTeacher(schoolId, true);
        return teachers.stream()
            .map(this::mapToResponseWithUser)
            .collect(Collectors.toList());
    }
    
    /**
     * Get teacher by class ID
     */
    public TeacherResponse getTeacherByClass(UUID classId) {
        log.info("Fetching teacher for class: {}", classId);
        Teacher teacher = teacherRepository.findByClassTeacherId(classId)
            .orElseThrow(() -> new ResourceNotFoundException("Teacher", "classTeacherId", classId));
        
        User user = userRepository.findById(teacher.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", teacher.getUserId()));
        
        return mapToResponse(teacher, user);
    }
    
    /**
     * Get teachers by subject
     */
    public List<TeacherResponse> getTeachersBySubject(UUID subjectId) {
        log.info("Fetching teachers for subject: {}", subjectId);
        String subjectIdStr = subjectId.toString();
        List<Teacher> teachers = teacherRepository.findBySubjectId(subjectIdStr);
        return teachers.stream()
            .map(this::mapToResponseWithUser)
            .collect(Collectors.toList());
    }
    
    /**
     * Get teachers by status
     */
    public List<TeacherResponse> getTeachersByStatus(UUID schoolId, TeacherStatus status) {
        log.info("Fetching teachers for school: {} with status: {}", schoolId, status);
        List<Teacher> teachers = teacherRepository.findBySchoolIdAndStatus(schoolId, status);
        return teachers.stream()
            .map(this::mapToResponseWithUser)
            .collect(Collectors.toList());
    }
    
    /**
     * Update teacher
     */
    @Transactional
    public TeacherResponse updateTeacher(UUID id, TeacherUpdateRequest request) {
        log.info("Updating teacher: {}", id);
        
        Teacher teacher = teacherRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", id));
        
        User user = userRepository.findById(teacher.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", teacher.getUserId()));
        
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
        
        // Update teacher fields if provided
        if (request.getQualification() != null) teacher.setQualification(request.getQualification());
        if (request.getExperience() != null) teacher.setExperience(request.getExperience());
        if (request.getSpecialization() != null) teacher.setSpecialization(request.getSpecialization());
        if (request.getStatus() != null) teacher.setStatus(request.getStatus());
        if (request.getIsClassTeacher() != null) teacher.setIsClassTeacher(request.getIsClassTeacher());
        if (request.getClassTeacherId() != null) {
            classRepository.findById(request.getClassTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", request.getClassTeacherId()));
            teacher.setClassTeacherId(request.getClassTeacherId());
        }
        
        // Update subjects if provided
        if (request.getSubjectIds() != null) {
            // Validate subjects exist
            for (UUID subjectId : request.getSubjectIds()) {
                subjectRepository.findById(subjectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", subjectId));
            }
            
            String subjectsCSV = request.getSubjectIds().stream()
                .map(UUID::toString)
                .collect(Collectors.joining(","));
            teacher.setSubjectsCSV(subjectsCSV);
        }
        
        teacher = teacherRepository.save(teacher);
        
        log.info("Teacher updated successfully: {}", id);
        return mapToResponse(teacher, user);
    }
    
    /**
     * Delete teacher
     */
    @Transactional
    public void deleteTeacher(UUID id) {
        log.info("Deleting teacher: {}", id);
        
        Teacher teacher = teacherRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", id));
        
        // Delete user (will cascade delete teacher due to foreign key)
        userRepository.deleteById(teacher.getUserId());
        
        log.info("Teacher deleted successfully: {}", id);
    }
    
    /**
     * Get teacher count by school
     */
    public long getTeacherCountBySchool(UUID schoolId) {
        return teacherRepository.countBySchoolId(schoolId);
    }
    
    /**
     * Map Teacher entity to TeacherResponse DTO
     */
    private TeacherResponse mapToResponse(Teacher teacher, User user) {
        TeacherResponse response = TeacherResponse.builder()
            .id(teacher.getId())
            .userId(user.getId())
            .employeeId(teacher.getEmployeeId())
            .joiningDate(teacher.getJoiningDate())
            .qualification(teacher.getQualification())
            .experience(teacher.getExperience())
            .specialization(teacher.getSpecialization())
            .status(teacher.getStatus())
            .isClassTeacher(teacher.getIsClassTeacher())
            .classTeacherId(teacher.getClassTeacherId())
            .subjectsCSV(teacher.getSubjectsCSV())
            .schoolId(teacher.getSchoolId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .fullName(user.getFullName())
            .phone(user.getPhone())
            .address(user.getAddress())
            .dateOfBirth(user.getDateOfBirth())
            .gender(user.getGender() != null ? user.getGender().getValue() : null)
            .profileImage(user.getProfileImage())
            .createdAt(teacher.getCreatedAt())
            .updatedAt(teacher.getUpdatedAt())
            .build();
        
        // Parse subject IDs from CSV
        if (teacher.getSubjectsCSV() != null && !teacher.getSubjectsCSV().isEmpty()) {
            List<UUID> subjectIds = List.of(teacher.getSubjectsCSV().split(","))
                .stream()
                .map(UUID::fromString)
                .collect(Collectors.toList());
            response.setSubjectIds(subjectIds);
            
            // Get subject names
            List<String> subjectNames = subjectIds.stream()
                .map(subjectId -> {
                    Subject subject = subjectRepository.findById(subjectId).orElse(null);
                    return subject != null ? subject.getName() : null;
                })
                .filter(name -> name != null)
                .collect(Collectors.toList());
            response.setSubjectNames(subjectNames);
        }
        
        // Get class name if applicable
        if (teacher.getClassTeacherId() != null) {
            Class teacherClass = classRepository.findById(teacher.getClassTeacherId()).orElse(null);
            if (teacherClass != null) {
                response.setClassName(teacherClass.getName());
                response.setSection(teacherClass.getSection());
            }
        }
        
        // Get school name
        if (teacher.getSchoolId() != null) {
            School school = schoolRepository.findById(teacher.getSchoolId()).orElse(null);
            if (school != null) {
                response.setSchoolName(school.getName());
            }
        }
        
        return response;
    }
    
    /**
     * Helper method to map with user fetch
     */
    private TeacherResponse mapToResponseWithUser(Teacher teacher) {
        User user = userRepository.findById(teacher.getUserId()).orElse(null);
        if (user == null) {
            throw new ResourceNotFoundException("User", "id", teacher.getUserId());
        }
        return mapToResponse(teacher, user);
    }
}

