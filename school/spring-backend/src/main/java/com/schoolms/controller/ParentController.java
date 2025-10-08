package com.schoolms.controller;

import com.schoolms.dto.parent.ParentCreateRequest;
import com.schoolms.dto.parent.ParentResponse;
import com.schoolms.dto.parent.ParentUpdateRequest;
import com.schoolms.dto.parent.StudentParentLinkRequest;
import com.schoolms.service.ParentService;
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
@RequestMapping("/parents")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ParentController {
    
    private final ParentService parentService;
    
    @PostMapping
    public ResponseEntity<ParentResponse> createParent(@Valid @RequestBody ParentCreateRequest request) {
        ParentResponse response = parentService.createParent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ParentResponse> getParentById(@PathVariable UUID id) {
        ParentResponse response = parentService.getParentById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/school/{schoolId}")
    public ResponseEntity<List<ParentResponse>> getParentsBySchool(@PathVariable UUID schoolId) {
        List<ParentResponse> response = parentService.getParentsBySchool(schoolId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/school/{schoolId}/page")
    public ResponseEntity<Page<ParentResponse>> getParentsBySchoolPaginated(
            @PathVariable UUID schoolId, Pageable pageable) {
        Page<ParentResponse> response = parentService.getParentsBySchool(schoolId, pageable);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ParentResponse>> getParentsByStudent(@PathVariable UUID studentId) {
        List<ParentResponse> response = parentService.getParentsByStudent(studentId);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ParentResponse> updateParent(
            @PathVariable UUID id, @Valid @RequestBody ParentUpdateRequest request) {
        ParentResponse response = parentService.updateParent(id, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteParent(@PathVariable UUID id) {
        parentService.deleteParent(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/link")
    public ResponseEntity<Void> linkStudentToParent(@Valid @RequestBody StudentParentLinkRequest request) {
        parentService.linkStudentToParent(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    
    @DeleteMapping("/unlink/{studentId}/{parentId}")
    public ResponseEntity<Void> unlinkStudentFromParent(
            @PathVariable UUID studentId, @PathVariable UUID parentId) {
        parentService.unlinkStudentFromParent(studentId, parentId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/school/{schoolId}/count")
    public ResponseEntity<Long> getParentCountBySchool(@PathVariable UUID schoolId) {
        long count = parentService.getParentCountBySchool(schoolId);
        return ResponseEntity.ok(count);
    }
}

