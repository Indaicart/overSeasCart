package com.schoolms.controller;

import com.schoolms.dto.student.StudentCreateRequest;
import com.schoolms.dto.student.StudentResponse;
import com.schoolms.dto.student.StudentUpdateRequest;
import com.schoolms.enums.StudentStatus;
import com.schoolms.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class StudentController {
    
    private final StudentService studentService;
    
    /**
     * Create new student
     * POST /api/students
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<StudentResponse> createStudent(@Valid @RequestBody StudentCreateRequest request) {
        log.info("Create student request for email: {}", request.getEmail());
        StudentResponse response = studentService.createStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Get student by ID
     * GET /api/students/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER', 'SUPER_ADMIN')")
    public ResponseEntity<StudentResponse> getStudentById(@PathVariable UUID id) {
        log.info("Get student request for ID: {}", id);
        StudentResponse response = studentService.getStudentById(id);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get student by student ID
     * GET /api/students/student-id/{studentId}
     */
    @GetMapping("/student-id/{studentId}")
    public ResponseEntity<StudentResponse> getStudentByStudentId(@PathVariable String studentId) {
        log.info("Get student request for student ID: {}", studentId);
        StudentResponse response = studentService.getStudentByStudentId(studentId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all students for a school
     * GET /api/students/school/{schoolId}
     */
    @GetMapping("/school/{schoolId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER', 'SUPER_ADMIN')")
    public ResponseEntity<List<StudentResponse>> getStudentsBySchool(@PathVariable UUID schoolId) {
        log.info("Get students request for school: {}", schoolId);
        List<StudentResponse> response = studentService.getStudentsBySchool(schoolId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get students by school with pagination
     * GET /api/students/school/{schoolId}/page
     */
    @GetMapping("/school/{schoolId}/page")
    public ResponseEntity<Page<StudentResponse>> getStudentsBySchoolPaginated(
            @PathVariable UUID schoolId,
            Pageable pageable) {
        log.info("Get students request for school: {} with pagination", schoolId);
        Page<StudentResponse> response = studentService.getStudentsBySchool(schoolId, pageable);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get students by class
     * GET /api/students/class/{classId}
     */
    @GetMapping("/class/{classId}")
    public ResponseEntity<List<StudentResponse>> getStudentsByClass(@PathVariable UUID classId) {
        log.info("Get students request for class: {}", classId);
        List<StudentResponse> response = studentService.getStudentsByClass(classId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get students by class with pagination
     * GET /api/students/class/{classId}/page
     */
    @GetMapping("/class/{classId}/page")
    public ResponseEntity<Page<StudentResponse>> getStudentsByClassPaginated(
            @PathVariable UUID classId,
            Pageable pageable) {
        log.info("Get students request for class: {} with pagination", classId);
        Page<StudentResponse> response = studentService.getStudentsByClass(classId, pageable);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get students by status
     * GET /api/students/school/{schoolId}/status/{status}
     */
    @GetMapping("/school/{schoolId}/status/{status}")
    public ResponseEntity<List<StudentResponse>> getStudentsByStatus(
            @PathVariable UUID schoolId,
            @PathVariable StudentStatus status) {
        log.info("Get students request for school: {} with status: {}", schoolId, status);
        List<StudentResponse> response = studentService.getStudentsByStatus(schoolId, status);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Update student
     * PUT /api/students/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<StudentResponse> updateStudent(
            @PathVariable UUID id,
            @Valid @RequestBody StudentUpdateRequest request) {
        log.info("Update student request for ID: {}", id);
        StudentResponse response = studentService.updateStudent(id, request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Delete student
     * DELETE /api/students/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable UUID id) {
        log.info("Delete student request for ID: {}", id);
        studentService.deleteStudent(id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get student count by school
     * GET /api/students/school/{schoolId}/count
     */
    @GetMapping("/school/{schoolId}/count")
    public ResponseEntity<Long> getStudentCountBySchool(@PathVariable UUID schoolId) {
        log.info("Get student count for school: {}", schoolId);
        long count = studentService.getStudentCountBySchool(schoolId);
        return ResponseEntity.ok(count);
    }
    
    /**
     * Get student count by class
     * GET /api/students/class/{classId}/count
     */
    @GetMapping("/class/{classId}/count")
    public ResponseEntity<Long> getStudentCountByClass(@PathVariable UUID classId) {
        log.info("Get student count for class: {}", classId);
        long count = studentService.getStudentCountByClass(classId);
        return ResponseEntity.ok(count);
    }
}

