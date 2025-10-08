package com.schoolms.service;

import com.schoolms.dto.class_.ClassCreateRequest;
import com.schoolms.dto.class_.ClassResponse;
import com.schoolms.dto.class_.ClassUpdateRequest;
import com.schoolms.entity.Class;
import com.schoolms.entity.School;
import com.schoolms.entity.Teacher;
import com.schoolms.exception.BadRequestException;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.repository.ClassRepository;
import com.schoolms.repository.SchoolRepository;
import com.schoolms.repository.StudentRepository;
import com.schoolms.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClassService {
    
    private final ClassRepository classRepository;
    private final SchoolRepository schoolRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    
    /**
     * Create new class
     */
    @Transactional
    public ClassResponse createClass(ClassCreateRequest request) {
        log.info("Creating new class: {} - {}", request.getName(), request.getSection());
        
        // Validate school exists
        School school = schoolRepository.findById(request.getSchoolId())
            .orElseThrow(() -> new ResourceNotFoundException("School", "id", request.getSchoolId()));
        
        // Check if class already exists for this school (name + section + academic year should be unique)
        if (classRepository.existsBySchoolIdAndNameAndSectionAndAcademicYear(
                request.getSchoolId(), request.getName(), request.getSection(), request.getAcademicYear())) {
            throw new BadRequestException("Class already exists for this academic year");
        }
        
        // Validate class teacher exists (if provided)
        if (request.getClassTeacherId() != null) {
            teacherRepository.findById(request.getClassTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", request.getClassTeacherId()));
        }
        
        // Create Class
        Class newClass = new Class();
        newClass.setName(request.getName());
        newClass.setSection(request.getSection());
        newClass.setGrade(request.getGrade());
        newClass.setAcademicYear(request.getAcademicYear());
        newClass.setClassTeacherId(request.getClassTeacherId());
        newClass.setCapacity(request.getCapacity());
        newClass.setRoomNumber(request.getRoomNumber());
        newClass.setSchoolId(request.getSchoolId());
        
        newClass = classRepository.save(newClass);
        
        log.info("Class created successfully with ID: {}", newClass.getId());
        return mapToResponse(newClass);
    }
    
    /**
     * Get class by ID
     */
    public ClassResponse getClassById(UUID id) {
        log.info("Fetching class by ID: {}", id);
        Class classEntity = classRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Class", "id", id));
        
        return mapToResponse(classEntity);
    }
    
    /**
     * Get all classes for a school
     */
    public List<ClassResponse> getClassesBySchool(UUID schoolId) {
        log.info("Fetching classes for school: {}", schoolId);
        List<Class> classes = classRepository.findBySchoolId(schoolId);
        return classes.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get classes by school with pagination
     */
    public Page<ClassResponse> getClassesBySchool(UUID schoolId, Pageable pageable) {
        log.info("Fetching classes for school: {} with pagination", schoolId);
        Page<Class> classes = classRepository.findBySchoolId(schoolId, pageable);
        return classes.map(this::mapToResponse);
    }
    
    /**
     * Get classes by academic year
     */
    public List<ClassResponse> getClassesByAcademicYear(UUID schoolId, String academicYear) {
        log.info("Fetching classes for school: {} and academic year: {}", schoolId, academicYear);
        List<Class> classes = classRepository.findBySchoolIdAndAcademicYear(schoolId, academicYear);
        return classes.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get classes by grade
     */
    public List<ClassResponse> getClassesByGrade(UUID schoolId, Integer grade) {
        log.info("Fetching classes for school: {} and grade: {}", schoolId, grade);
        List<Class> classes = classRepository.findBySchoolIdAndGrade(schoolId, grade);
        return classes.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Update class
     */
    @Transactional
    public ClassResponse updateClass(UUID id, ClassUpdateRequest request) {
        log.info("Updating class: {}", id);
        
        Class classEntity = classRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Class", "id", id));
        
        // Update fields if provided
        if (request.getName() != null) classEntity.setName(request.getName());
        if (request.getSection() != null) classEntity.setSection(request.getSection());
        if (request.getGrade() != null) classEntity.setGrade(request.getGrade());
        if (request.getAcademicYear() != null) classEntity.setAcademicYear(request.getAcademicYear());
        if (request.getCapacity() != null) classEntity.setCapacity(request.getCapacity());
        if (request.getRoomNumber() != null) classEntity.setRoomNumber(request.getRoomNumber());
        
        if (request.getClassTeacherId() != null) {
            teacherRepository.findById(request.getClassTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", request.getClassTeacherId()));
            classEntity.setClassTeacherId(request.getClassTeacherId());
        }
        
        classEntity = classRepository.save(classEntity);
        
        log.info("Class updated successfully: {}", id);
        return mapToResponse(classEntity);
    }
    
    /**
     * Delete class
     */
    @Transactional
    public void deleteClass(UUID id) {
        log.info("Deleting class: {}", id);
        
        Class classEntity = classRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Class", "id", id));
        
        // Check if there are students in this class
        long studentCount = studentRepository.countByClassId(id);
        if (studentCount > 0) {
            throw new BadRequestException("Cannot delete class with existing students");
        }
        
        classRepository.delete(classEntity);
        
        log.info("Class deleted successfully: {}", id);
    }
    
    /**
     * Get class count by school
     */
    public long getClassCountBySchool(UUID schoolId) {
        return classRepository.countBySchoolId(schoolId);
    }
    
    /**
     * Map Class entity to ClassResponse DTO
     */
    private ClassResponse mapToResponse(Class classEntity) {
        ClassResponse response = ClassResponse.builder()
            .id(classEntity.getId())
            .name(classEntity.getName())
            .section(classEntity.getSection())
            .grade(classEntity.getGrade())
            .academicYear(classEntity.getAcademicYear())
            .classTeacherId(classEntity.getClassTeacherId())
            .capacity(classEntity.getCapacity())
            .roomNumber(classEntity.getRoomNumber())
            .schoolId(classEntity.getSchoolId())
            .createdAt(classEntity.getCreatedAt())
            .updatedAt(classEntity.getUpdatedAt())
            .build();
        
        // Get class teacher name if applicable
        if (classEntity.getClassTeacherId() != null) {
            Teacher teacher = teacherRepository.findById(classEntity.getClassTeacherId()).orElse(null);
            if (teacher != null) {
                response.setClassTeacherEmployeeId(teacher.getEmployeeId());
                // You could also get the user name from userRepository if needed
            }
        }
        
        // Get school name
        if (classEntity.getSchoolId() != null) {
            School school = schoolRepository.findById(classEntity.getSchoolId()).orElse(null);
            if (school != null) {
                response.setSchoolName(school.getName());
            }
        }
        
        // Get student count
        long studentCount = studentRepository.countByClassId(classEntity.getId());
        response.setStudentCount(studentCount);
        
        return response;
    }
}

