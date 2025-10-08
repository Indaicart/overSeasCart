package com.schoolms.controller;

import com.schoolms.dto.subject.SubjectCreateRequest;
import com.schoolms.dto.subject.SubjectResponse;
import com.schoolms.dto.subject.SubjectUpdateRequest;
import com.schoolms.service.SubjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/subjects")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SubjectController {
    
    private final SubjectService subjectService;
    
    /**
     * Create new subject
     * POST /api/subjects
     */
    @PostMapping
    public ResponseEntity<SubjectResponse> createSubject(@Valid @RequestBody SubjectCreateRequest request) {
        log.info("Create subject request: {}", request.getName());
        SubjectResponse response = subjectService.createSubject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Get subject by ID
     * GET /api/subjects/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<SubjectResponse> getSubjectById(@PathVariable UUID id) {
        log.info("Get subject request for ID: {}", id);
        SubjectResponse response = subjectService.getSubjectById(id);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get subject by code
     * GET /api/subjects/school/{schoolId}/code/{code}
     */
    @GetMapping("/school/{schoolId}/code/{code}")
    public ResponseEntity<SubjectResponse> getSubjectByCode(
            @PathVariable UUID schoolId,
            @PathVariable String code) {
        log.info("Get subject request for code: {} in school: {}", code, schoolId);
        SubjectResponse response = subjectService.getSubjectByCode(schoolId, code);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all subjects for a school
     * GET /api/subjects/school/{schoolId}
     */
    @GetMapping("/school/{schoolId}")
    public ResponseEntity<List<SubjectResponse>> getSubjectsBySchool(@PathVariable UUID schoolId) {
        log.info("Get subjects request for school: {}", schoolId);
        List<SubjectResponse> response = subjectService.getSubjectsBySchool(schoolId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get subjects by school with pagination
     * GET /api/subjects/school/{schoolId}/page
     */
    @GetMapping("/school/{schoolId}/page")
    public ResponseEntity<Page<SubjectResponse>> getSubjectsBySchoolPaginated(
            @PathVariable UUID schoolId,
            Pageable pageable) {
        log.info("Get subjects request for school: {} with pagination", schoolId);
        Page<SubjectResponse> response = subjectService.getSubjectsBySchool(schoolId, pageable);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get subjects by class
     * GET /api/subjects/class/{classId}
     */
    @GetMapping("/class/{classId}")
    public ResponseEntity<List<SubjectResponse>> getSubjectsByClass(@PathVariable UUID classId) {
        log.info("Get subjects request for class: {}", classId);
        List<SubjectResponse> response = subjectService.getSubjectsByClass(classId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get subjects by class with pagination
     * GET /api/subjects/class/{classId}/page
     */
    @GetMapping("/class/{classId}/page")
    public ResponseEntity<Page<SubjectResponse>> getSubjectsByClassPaginated(
            @PathVariable UUID classId,
            Pageable pageable) {
        log.info("Get subjects request for class: {} with pagination", classId);
        Page<SubjectResponse> response = subjectService.getSubjectsByClass(classId, pageable);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get subjects taught by a teacher
     * GET /api/subjects/teacher/{teacherId}
     */
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<SubjectResponse>> getSubjectsByTeacher(@PathVariable UUID teacherId) {
        log.info("Get subjects request for teacher: {}", teacherId);
        List<SubjectResponse> response = subjectService.getSubjectsByTeacher(teacherId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Update subject
     * PUT /api/subjects/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<SubjectResponse> updateSubject(
            @PathVariable UUID id,
            @Valid @RequestBody SubjectUpdateRequest request) {
        log.info("Update subject request for ID: {}", id);
        SubjectResponse response = subjectService.updateSubject(id, request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Delete subject
     * DELETE /api/subjects/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable UUID id) {
        log.info("Delete subject request for ID: {}", id);
        subjectService.deleteSubject(id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get subject count by school
     * GET /api/subjects/school/{schoolId}/count
     */
    @GetMapping("/school/{schoolId}/count")
    public ResponseEntity<Long> getSubjectCountBySchool(@PathVariable UUID schoolId) {
        log.info("Get subject count for school: {}", schoolId);
        long count = subjectService.getSubjectCountBySchool(schoolId);
        return ResponseEntity.ok(count);
    }
    
    /**
     * Get subject count by class
     * GET /api/subjects/class/{classId}/count
     */
    @GetMapping("/class/{classId}/count")
    public ResponseEntity<Long> getSubjectCountByClass(@PathVariable UUID classId) {
        log.info("Get subject count for class: {}", classId);
        long count = subjectService.getSubjectCountByClass(classId);
        return ResponseEntity.ok(count);
    }
}

