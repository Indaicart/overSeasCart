package com.schoolms.service;

import com.schoolms.dto.subject.SubjectCreateRequest;
import com.schoolms.dto.subject.SubjectResponse;
import com.schoolms.dto.subject.SubjectUpdateRequest;
import com.schoolms.entity.Class;
import com.schoolms.entity.School;
import com.schoolms.entity.Subject;
import com.schoolms.entity.Teacher;
import com.schoolms.entity.User;
import com.schoolms.exception.BadRequestException;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.repository.ClassRepository;
import com.schoolms.repository.SchoolRepository;
import com.schoolms.repository.StudentRepository;
import com.schoolms.repository.SubjectRepository;
import com.schoolms.repository.TeacherRepository;
import com.schoolms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubjectService {
    
    private final SubjectRepository subjectRepository;
    private final ClassRepository classRepository;
    private final SchoolRepository schoolRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    
    /**
     * Create new subject
     */
    @Transactional
    public SubjectResponse createSubject(SubjectCreateRequest request) {
        log.info("Creating new subject: {} for class: {}", request.getName(), request.getClassId());
        
        // Validate school exists
        School school = schoolRepository.findById(request.getSchoolId())
            .orElseThrow(() -> new ResourceNotFoundException("School", "id", request.getSchoolId()));
        
        // Validate class exists
        Class classEntity = classRepository.findById(request.getClassId())
            .orElseThrow(() -> new ResourceNotFoundException("Class", "id", request.getClassId()));
        
        // Check if subject code already exists for this school
        if (subjectRepository.existsBySchoolIdAndCode(request.getSchoolId(), request.getCode())) {
            throw new BadRequestException("Subject code already exists in this school");
        }
        
        // Create Subject
        Subject subject = new Subject();
        subject.setName(request.getName());
        subject.setCode(request.getCode());
        subject.setDescription(request.getDescription());
        subject.setClassId(request.getClassId());
        subject.setCredits(request.getCredits());
        subject.setSchoolId(request.getSchoolId());
        
        subject = subjectRepository.save(subject);
        
        log.info("Subject created successfully with ID: {}", subject.getId());
        return mapToResponse(subject, classEntity);
    }
    
    /**
     * Get subject by ID
     */
    public SubjectResponse getSubjectById(UUID id) {
        log.info("Fetching subject by ID: {}", id);
        Subject subject = subjectRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id));
        
        Class classEntity = classRepository.findById(subject.getClassId())
            .orElseThrow(() -> new ResourceNotFoundException("Class", "id", subject.getClassId()));
        
        return mapToResponse(subject, classEntity);
    }
    
    /**
     * Get subject by code
     */
    public SubjectResponse getSubjectByCode(UUID schoolId, String code) {
        log.info("Fetching subject by code: {} for school: {}", code, schoolId);
        Subject subject = subjectRepository.findBySchoolIdAndCode(schoolId, code)
            .orElseThrow(() -> new ResourceNotFoundException("Subject", "code", code));
        
        Class classEntity = classRepository.findById(subject.getClassId())
            .orElseThrow(() -> new ResourceNotFoundException("Class", "id", subject.getClassId()));
        
        return mapToResponse(subject, classEntity);
    }
    
    /**
     * Get all subjects for a school
     */
    public List<SubjectResponse> getSubjectsBySchool(UUID schoolId) {
        log.info("Fetching subjects for school: {}", schoolId);
        List<Subject> subjects = subjectRepository.findBySchoolId(schoolId);
        return subjects.stream()
            .map(this::mapToResponseWithClass)
            .collect(Collectors.toList());
    }
    
    /**
     * Get subjects by school with pagination
     */
    public Page<SubjectResponse> getSubjectsBySchool(UUID schoolId, Pageable pageable) {
        log.info("Fetching subjects for school: {} with pagination", schoolId);
        Page<Subject> subjects = subjectRepository.findBySchoolId(schoolId, pageable);
        return subjects.map(this::mapToResponseWithClass);
    }
    
    /**
     * Get subjects by class
     */
    public List<SubjectResponse> getSubjectsByClass(UUID classId) {
        log.info("Fetching subjects for class: {}", classId);
        List<Subject> subjects = subjectRepository.findByClassId(classId);
        return subjects.stream()
            .map(this::mapToResponseWithClass)
            .collect(Collectors.toList());
    }
    
    /**
     * Get subjects by class with pagination
     */
    public Page<SubjectResponse> getSubjectsByClass(UUID classId, Pageable pageable) {
        log.info("Fetching subjects for class: {} with pagination", classId);
        Page<Subject> subjects = subjectRepository.findByClassId(classId, pageable);
        return subjects.map(this::mapToResponseWithClass);
    }
    
    /**
     * Get subjects taught by a teacher
     */
    public List<SubjectResponse> getSubjectsByTeacher(UUID teacherId) {
        log.info("Fetching subjects for teacher: {}", teacherId);
        
        Teacher teacher = teacherRepository.findById(teacherId)
            .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", teacherId));
        
        if (teacher.getSubjectsCSV() == null || teacher.getSubjectsCSV().isEmpty()) {
            return new ArrayList<>();
        }
        
        List<UUID> subjectIds = List.of(teacher.getSubjectsCSV().split(","))
            .stream()
            .map(UUID::fromString)
            .collect(Collectors.toList());
        
        return subjectIds.stream()
            .map(subjectId -> {
                Subject subject = subjectRepository.findById(subjectId).orElse(null);
                return subject != null ? mapToResponseWithClass(subject) : null;
            })
            .filter(response -> response != null)
            .collect(Collectors.toList());
    }
    
    /**
     * Update subject
     */
    @Transactional
    public SubjectResponse updateSubject(UUID id, SubjectUpdateRequest request) {
        log.info("Updating subject: {}", id);
        
        Subject subject = subjectRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id));
        
        // Update fields if provided
        if (request.getName() != null) subject.setName(request.getName());
        if (request.getDescription() != null) subject.setDescription(request.getDescription());
        if (request.getCredits() != null) subject.setCredits(request.getCredits());
        
        if (request.getCode() != null && !request.getCode().equals(subject.getCode())) {
            if (subjectRepository.existsBySchoolIdAndCode(subject.getSchoolId(), request.getCode())) {
                throw new BadRequestException("Subject code already exists in this school");
            }
            subject.setCode(request.getCode());
        }
        
        if (request.getClassId() != null) {
            classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", request.getClassId()));
            subject.setClassId(request.getClassId());
        }
        
        subject = subjectRepository.save(subject);
        
        Class classEntity = classRepository.findById(subject.getClassId())
            .orElseThrow(() -> new ResourceNotFoundException("Class", "id", subject.getClassId()));
        
        log.info("Subject updated successfully: {}", id);
        return mapToResponse(subject, classEntity);
    }
    
    /**
     * Delete subject
     */
    @Transactional
    public void deleteSubject(UUID id) {
        log.info("Deleting subject: {}", id);
        
        Subject subject = subjectRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id));
        
        // Check if there are teachers assigned to this subject
        List<Teacher> teachers = teacherRepository.findBySubjectId(id.toString());
        if (!teachers.isEmpty()) {
            throw new BadRequestException("Cannot delete subject with assigned teachers. Remove teacher assignments first.");
        }
        
        subjectRepository.delete(subject);
        
        log.info("Subject deleted successfully: {}", id);
    }
    
    /**
     * Get subject count by school
     */
    public long getSubjectCountBySchool(UUID schoolId) {
        return subjectRepository.countBySchoolId(schoolId);
    }
    
    /**
     * Get subject count by class
     */
    public long getSubjectCountByClass(UUID classId) {
        return subjectRepository.countByClassId(classId);
    }
    
    /**
     * Map Subject entity to SubjectResponse DTO
     */
    private SubjectResponse mapToResponse(Subject subject, Class classEntity) {
        SubjectResponse response = SubjectResponse.builder()
            .id(subject.getId())
            .name(subject.getName())
            .code(subject.getCode())
            .description(subject.getDescription())
            .classId(subject.getClassId())
            .className(classEntity.getName())
            .section(classEntity.getSection())
            .grade(classEntity.getGrade())
            .credits(subject.getCredits())
            .schoolId(subject.getSchoolId())
            .createdAt(subject.getCreatedAt())
            .updatedAt(subject.getUpdatedAt())
            .build();
        
        // Get school name
        if (subject.getSchoolId() != null) {
            School school = schoolRepository.findById(subject.getSchoolId()).orElse(null);
            if (school != null) {
                response.setSchoolName(school.getName());
            }
        }
        
        // Get teachers teaching this subject
        List<Teacher> teachers = teacherRepository.findBySubjectId(subject.getId().toString());
        if (!teachers.isEmpty()) {
            response.setTeacherIds(teachers.stream().map(Teacher::getId).collect(Collectors.toList()));
            
            List<String> teacherNames = teachers.stream()
                .map(teacher -> {
                    User user = userRepository.findById(teacher.getUserId()).orElse(null);
                    return user != null ? user.getFullName() : null;
                })
                .filter(name -> name != null)
                .collect(Collectors.toList());
            response.setTeacherNames(teacherNames);
        }
        
        // Get student count (students in the class)
        long studentCount = studentRepository.countByClassId(subject.getClassId());
        response.setStudentCount(studentCount);
        
        return response;
    }
    
    /**
     * Helper method to map with class fetch
     */
    private SubjectResponse mapToResponseWithClass(Subject subject) {
        Class classEntity = classRepository.findById(subject.getClassId()).orElse(null);
        if (classEntity == null) {
            throw new ResourceNotFoundException("Class", "id", subject.getClassId());
        }
        return mapToResponse(subject, classEntity);
    }
}

