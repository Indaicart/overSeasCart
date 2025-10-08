package com.schoolms.controller;

import com.schoolms.dto.class_.ClassCreateRequest;
import com.schoolms.dto.class_.ClassResponse;
import com.schoolms.dto.class_.ClassUpdateRequest;
import com.schoolms.service.ClassService;
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
@RequestMapping("/classes")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ClassController {
    
    private final ClassService classService;
    
    /**
     * Create new class
     * POST /api/classes
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ClassResponse> createClass(@Valid @RequestBody ClassCreateRequest request) {
        log.info("Create class request for: {} - {}", request.getName(), request.getSection());
        ClassResponse response = classService.createClass(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Get class by ID
     * GET /api/classes/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER', 'SUPER_ADMIN')")
    public ResponseEntity<ClassResponse> getClassById(@PathVariable UUID id) {
        log.info("Get class request for ID: {}", id);
        ClassResponse response = classService.getClassById(id);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all classes for a school
     * GET /api/classes/school/{schoolId}
     */
    @GetMapping("/school/{schoolId}")
    public ResponseEntity<List<ClassResponse>> getClassesBySchool(@PathVariable UUID schoolId) {
        log.info("Get classes request for school: {}", schoolId);
        List<ClassResponse> response = classService.getClassesBySchool(schoolId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get classes by school with pagination
     * GET /api/classes/school/{schoolId}/page
     */
    @GetMapping("/school/{schoolId}/page")
    public ResponseEntity<Page<ClassResponse>> getClassesBySchoolPaginated(
            @PathVariable UUID schoolId,
            Pageable pageable) {
        log.info("Get classes request for school: {} with pagination", schoolId);
        Page<ClassResponse> response = classService.getClassesBySchool(schoolId, pageable);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get classes by academic year
     * GET /api/classes/school/{schoolId}/academic-year/{academicYear}
     */
    @GetMapping("/school/{schoolId}/academic-year/{academicYear}")
    public ResponseEntity<List<ClassResponse>> getClassesByAcademicYear(
            @PathVariable UUID schoolId,
            @PathVariable String academicYear) {
        log.info("Get classes request for school: {} and academic year: {}", schoolId, academicYear);
        List<ClassResponse> response = classService.getClassesByAcademicYear(schoolId, academicYear);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get classes by grade
     * GET /api/classes/school/{schoolId}/grade/{grade}
     */
    @GetMapping("/school/{schoolId}/grade/{grade}")
    public ResponseEntity<List<ClassResponse>> getClassesByGrade(
            @PathVariable UUID schoolId,
            @PathVariable Integer grade) {
        log.info("Get classes request for school: {} and grade: {}", schoolId, grade);
        List<ClassResponse> response = classService.getClassesByGrade(schoolId, grade);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Update class
     * PUT /api/classes/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ClassResponse> updateClass(
            @PathVariable UUID id,
            @Valid @RequestBody ClassUpdateRequest request) {
        log.info("Update class request for ID: {}", id);
        ClassResponse response = classService.updateClass(id, request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Delete class
     * DELETE /api/classes/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClass(@PathVariable UUID id) {
        log.info("Delete class request for ID: {}", id);
        classService.deleteClass(id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get class count by school
     * GET /api/classes/school/{schoolId}/count
     */
    @GetMapping("/school/{schoolId}/count")
    public ResponseEntity<Long> getClassCountBySchool(@PathVariable UUID schoolId) {
        log.info("Get class count for school: {}", schoolId);
        long count = classService.getClassCountBySchool(schoolId);
        return ResponseEntity.ok(count);
    }
}

