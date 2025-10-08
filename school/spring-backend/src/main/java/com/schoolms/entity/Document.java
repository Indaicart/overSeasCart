package com.schoolms.entity;

import com.schoolms.enums.DocumentCategory;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "documents", indexes = {
    @Index(name = "idx_documents_category", columnList = "category"),
    @Index(name = "idx_documents_uploaded_by", columnList = "uploaded_by"),
    @Index(name = "idx_documents_student", columnList = "student_id"),
    @Index(name = "idx_documents_teacher", columnList = "teacher_id")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Document extends BaseEntity {
    
    @Column(nullable = false, length = 255)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;
    
    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;
    
    @Column(name = "file_type", nullable = false, length = 50)
    private String fileType;
    
    @Column(name = "file_size", nullable = false)
    private Long fileSize;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DocumentCategory category;
    
    @Column(name = "uploaded_by", columnDefinition = "UUID")
    private UUID uploadedBy;
    
    @Column(name = "student_id", columnDefinition = "UUID")
    private UUID studentId;
    
    @Column(name = "teacher_id", columnDefinition = "UUID")
    private UUID teacherId;
    
    @Column(name = "is_public")
    private Boolean isPublic = false;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", insertable = false, updatable = false)
    private User uploadedByUser;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", insertable = false, updatable = false)
    private Student student;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", insertable = false, updatable = false)
    private Teacher teacher;
}

