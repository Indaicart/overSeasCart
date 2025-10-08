package com.schoolms.service;

import com.schoolms.dto.document.DocumentCreateRequest;
import com.schoolms.dto.document.DocumentResponse;
import com.schoolms.entity.Document;
import com.schoolms.entity.Student;
import com.schoolms.entity.User;
import com.schoolms.enums.DocumentCategory;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.repository.DocumentRepository;
import com.schoolms.repository.StudentRepository;
import com.schoolms.repository.UserRepository;
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
public class DocumentService {
    
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    
    @Transactional
    public DocumentResponse uploadDocument(DocumentCreateRequest request) {
        log.info("Uploading document: {}", request.getTitle());
        
        userRepository.findById(request.getUploadedById())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUploadedById()));
        
        if (request.getStudentId() != null) {
            studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", request.getStudentId()));
        }
        
        Document document = new Document();
        document.setTitle(request.getTitle());
        document.setDescription(request.getDescription());
        document.setCategory(request.getCategory());
        document.setFileName(request.getFileName());
        document.setFilePath(request.getFilePath());
        document.setFileType(request.getFileType());
        document.setFileSize(request.getFileSize());
        document.setUploadedById(request.getUploadedById());
        document.setStudentId(request.getStudentId());
        document.setSchoolId(request.getSchoolId());
        
        document = documentRepository.save(document);
        log.info("Document uploaded with ID: {}", document.getId());
        return mapToResponse(document);
    }
    
    public DocumentResponse getDocumentById(UUID id) {
        Document document = documentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Document", "id", id));
        return mapToResponse(document);
    }
    
    public List<DocumentResponse> getDocumentsBySchool(UUID schoolId) {
        List<Document> documents = documentRepository.findBySchoolId(schoolId);
        return documents.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    public Page<DocumentResponse> getDocumentsBySchool(UUID schoolId, Pageable pageable) {
        Page<Document> documents = documentRepository.findBySchoolId(schoolId, pageable);
        return documents.map(this::mapToResponse);
    }
    
    public List<DocumentResponse> getDocumentsByStudent(UUID studentId) {
        List<Document> documents = documentRepository.findByStudentId(studentId);
        return documents.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    public List<DocumentResponse> getDocumentsByCategory(UUID schoolId, DocumentCategory category) {
        List<Document> documents = documentRepository.findBySchoolIdAndCategory(schoolId, category);
        return documents.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    @Transactional
    public void deleteDocument(UUID id) {
        Document document = documentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Document", "id", id));
        documentRepository.delete(document);
    }
    
    private DocumentResponse mapToResponse(Document document) {
        DocumentResponse response = DocumentResponse.builder()
            .id(document.getId())
            .title(document.getTitle())
            .description(document.getDescription())
            .category(document.getCategory())
            .fileName(document.getFileName())
            .filePath(document.getFilePath())
            .fileType(document.getFileType())
            .fileSize(document.getFileSize())
            .uploadedById(document.getUploadedById())
            .studentId(document.getStudentId())
            .schoolId(document.getSchoolId())
            .createdAt(document.getCreatedAt())
            .build();
        
        User uploadedBy = userRepository.findById(document.getUploadedById()).orElse(null);
        if (uploadedBy != null) response.setUploadedByName(uploadedBy.getFullName());
        
        if (document.getStudentId() != null) {
            Student student = studentRepository.findById(document.getStudentId()).orElse(null);
            if (student != null) {
                User studentUser = userRepository.findById(student.getUserId()).orElse(null);
                if (studentUser != null) response.setStudentName(studentUser.getFullName());
            }
        }
        
        return response;
    }
}

