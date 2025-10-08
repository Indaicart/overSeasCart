package com.schoolms.controller;

import com.schoolms.dto.grade.*;
import com.schoolms.service.GradeService;
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
@RequestMapping("/grades")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class GradeController {
    
    private final GradeService gradeService;
    
    @PostMapping
    public ResponseEntity<GradeResponse> addGrade(@Valid @RequestBody GradeCreateRequest request) {
        log.info("Add grade request for student: {}", request.getStudentId());
        GradeResponse response = gradeService.addGrade(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PostMapping("/bulk")
    public ResponseEntity<List<GradeResponse>> addBulkGrades(@Valid @RequestBody GradeBulkCreateRequest request) {
        log.info("Add bulk grades request for subject: {}", request.getSubjectId());
        List<GradeResponse> response = gradeService.addBulkGrades(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<GradeResponse> getGradeById(@PathVariable UUID id) {
        GradeResponse response = gradeService.getGradeById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<GradeResponse>> getGradesByStudent(@PathVariable UUID studentId) {
        List<GradeResponse> response = gradeService.getGradesByStudent(studentId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/student/{studentId}/page")
    public ResponseEntity<Page<GradeResponse>> getGradesByStudentPaginated(
            @PathVariable UUID studentId, Pageable pageable) {
        Page<GradeResponse> response = gradeService.getGradesByStudent(studentId, pageable);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<GradeResponse>> getGradesBySubject(@PathVariable UUID subjectId) {
        List<GradeResponse> response = gradeService.getGradesBySubject(subjectId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/student/{studentId}/subject/{subjectId}")
    public ResponseEntity<List<GradeResponse>> getGradesByStudentAndSubject(
            @PathVariable UUID studentId, @PathVariable UUID subjectId) {
        List<GradeResponse> response = gradeService.getGradesByStudentAndSubject(studentId, subjectId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/student/{studentId}/stats")
    public ResponseEntity<GradeStatsResponse> getStudentGradeStats(@PathVariable UUID studentId) {
        GradeStatsResponse response = gradeService.getStudentGradeStats(studentId);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<GradeResponse> updateGrade(
            @PathVariable UUID id, @Valid @RequestBody GradeUpdateRequest request) {
        GradeResponse response = gradeService.updateGrade(id, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGrade(@PathVariable UUID id) {
        gradeService.deleteGrade(id);
        return ResponseEntity.ok().build();
    }
}

