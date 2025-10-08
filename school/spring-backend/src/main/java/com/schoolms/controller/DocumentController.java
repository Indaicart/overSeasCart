package com.schoolms.controller;

import com.schoolms.dto.document.DocumentCreateRequest;
import com.schoolms.dto.document.DocumentResponse;
import com.schoolms.enums.DocumentCategory;
import com.schoolms.service.DocumentService;
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
@RequestMapping("/documents")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class DocumentController {
    
    private final DocumentService documentService;
    
    @PostMapping
    public ResponseEntity<DocumentResponse> uploadDocument(@Valid @RequestBody DocumentCreateRequest request) {
        DocumentResponse response = documentService.uploadDocument(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> getDocumentById(@PathVariable UUID id) {
        DocumentResponse response = documentService.getDocumentById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/school/{schoolId}")
    public ResponseEntity<List<DocumentResponse>> getDocumentsBySchool(@PathVariable UUID schoolId) {
        List<DocumentResponse> response = documentService.getDocumentsBySchool(schoolId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/school/{schoolId}/page")
    public ResponseEntity<Page<DocumentResponse>> getDocumentsBySchoolPaginated(
            @PathVariable UUID schoolId, Pageable pageable) {
        Page<DocumentResponse> response = documentService.getDocumentsBySchool(schoolId, pageable);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<DocumentResponse>> getDocumentsByStudent(@PathVariable UUID studentId) {
        List<DocumentResponse> response = documentService.getDocumentsByStudent(studentId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/school/{schoolId}/category/{category}")
    public ResponseEntity<List<DocumentResponse>> getDocumentsByCategory(
            @PathVariable UUID schoolId, @PathVariable DocumentCategory category) {
        List<DocumentResponse> response = documentService.getDocumentsByCategory(schoolId, category);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID id) {
        documentService.deleteDocument(id);
        return ResponseEntity.ok().build();
    }
}

