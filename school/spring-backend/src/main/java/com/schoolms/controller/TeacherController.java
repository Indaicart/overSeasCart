package com.schoolms.controller;

import com.schoolms.dto.teacher.TeacherCreateRequest;
import com.schoolms.dto.teacher.TeacherResponse;
import com.schoolms.dto.teacher.TeacherUpdateRequest;
import com.schoolms.enums.TeacherStatus;
import com.schoolms.service.TeacherService;
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
@RequestMapping("/teachers")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class TeacherController {
    
    private final TeacherService teacherService;
    
    /**
     * Create new teacher
     * POST /api/teachers
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<TeacherResponse> createTeacher(@Valid @RequestBody TeacherCreateRequest request) {
        log.info("Create teacher request for email: {}", request.getEmail());
        TeacherResponse response = teacherService.createTeacher(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Get teacher by ID
     * GET /api/teachers/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER', 'SUPER_ADMIN')")
    public ResponseEntity<TeacherResponse> getTeacherById(@PathVariable UUID id) {
        log.info("Get teacher request for ID: {}", id);
        TeacherResponse response = teacherService.getTeacherById(id);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get teacher by employee ID
     * GET /api/teachers/employee-id/{employeeId}
     */
    @GetMapping("/employee-id/{employeeId}")
    public ResponseEntity<TeacherResponse> getTeacherByEmployeeId(@PathVariable String employeeId) {
        log.info("Get teacher request for employee ID: {}", employeeId);
        TeacherResponse response = teacherService.getTeacherByEmployeeId(employeeId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all teachers for a school
     * GET /api/teachers/school/{schoolId}
     */
    @GetMapping("/school/{schoolId}")
    public ResponseEntity<List<TeacherResponse>> getTeachersBySchool(@PathVariable UUID schoolId) {
        log.info("Get teachers request for school: {}", schoolId);
        List<TeacherResponse> response = teacherService.getTeachersBySchool(schoolId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get teachers by school with pagination
     * GET /api/teachers/school/{schoolId}/page
     */
    @GetMapping("/school/{schoolId}/page")
    public ResponseEntity<Page<TeacherResponse>> getTeachersBySchoolPaginated(
            @PathVariable UUID schoolId,
            Pageable pageable) {
        log.info("Get teachers request for school: {} with pagination", schoolId);
        Page<TeacherResponse> response = teacherService.getTeachersBySchool(schoolId, pageable);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get class teachers by school
     * GET /api/teachers/school/{schoolId}/class-teachers
     */
    @GetMapping("/school/{schoolId}/class-teachers")
    public ResponseEntity<List<TeacherResponse>> getClassTeachers(@PathVariable UUID schoolId) {
        log.info("Get class teachers request for school: {}", schoolId);
        List<TeacherResponse> response = teacherService.getClassTeachers(schoolId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get teacher by class ID
     * GET /api/teachers/class/{classId}
     */
    @GetMapping("/class/{classId}")
    public ResponseEntity<TeacherResponse> getTeacherByClass(@PathVariable UUID classId) {
        log.info("Get teacher request for class: {}", classId);
        TeacherResponse response = teacherService.getTeacherByClass(classId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get teachers by subject
     * GET /api/teachers/subject/{subjectId}
     */
    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<TeacherResponse>> getTeachersBySubject(@PathVariable UUID subjectId) {
        log.info("Get teachers request for subject: {}", subjectId);
        List<TeacherResponse> response = teacherService.getTeachersBySubject(subjectId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get teachers by status
     * GET /api/teachers/school/{schoolId}/status/{status}
     */
    @GetMapping("/school/{schoolId}/status/{status}")
    public ResponseEntity<List<TeacherResponse>> getTeachersByStatus(
            @PathVariable UUID schoolId,
            @PathVariable TeacherStatus status) {
        log.info("Get teachers request for school: {} with status: {}", schoolId, status);
        List<TeacherResponse> response = teacherService.getTeachersByStatus(schoolId, status);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Update teacher
     * PUT /api/teachers/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<TeacherResponse> updateTeacher(
            @PathVariable UUID id,
            @Valid @RequestBody TeacherUpdateRequest request) {
        log.info("Update teacher request for ID: {}", id);
        TeacherResponse response = teacherService.updateTeacher(id, request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Delete teacher
     * DELETE /api/teachers/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeacher(@PathVariable UUID id) {
        log.info("Delete teacher request for ID: {}", id);
        teacherService.deleteTeacher(id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get teacher count by school
     * GET /api/teachers/school/{schoolId}/count
     */
    @GetMapping("/school/{schoolId}/count")
    public ResponseEntity<Long> getTeacherCountBySchool(@PathVariable UUID schoolId) {
        log.info("Get teacher count for school: {}", schoolId);
        long count = teacherService.getTeacherCountBySchool(schoolId);
        return ResponseEntity.ok(count);
    }
}

