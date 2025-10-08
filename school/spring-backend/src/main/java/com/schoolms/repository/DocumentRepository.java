package com.schoolms.repository;

import com.schoolms.entity.Document;
import com.schoolms.enums.DocumentCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID>, JpaSpecificationExecutor<Document> {
    
    List<Document> findByStudentId(UUID studentId);
    
    Page<Document> findByStudentId(UUID studentId, Pageable pageable);
    
    List<Document> findByTeacherId(UUID teacherId);
    
    Page<Document> findByTeacherId(UUID teacherId, Pageable pageable);
    
    List<Document> findByUploadedBy(UUID uploadedBy);
    
    List<Document> findByCategory(DocumentCategory category);
    
    Page<Document> findByCategory(DocumentCategory category, Pageable pageable);
    
    List<Document> findByStudentIdAndCategory(UUID studentId, DocumentCategory category);
    
    List<Document> findByIsPublic(Boolean isPublic);
}

