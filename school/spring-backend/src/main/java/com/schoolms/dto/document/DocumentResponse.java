package com.schoolms.dto.document;

import com.schoolms.enums.DocumentCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponse {
    
    private UUID id;
    private String title;
    private String description;
    private DocumentCategory category;
    private String fileName;
    private String filePath;
    private String fileType;
    private Long fileSize;
    private UUID uploadedById;
    private String uploadedByName;
    private UUID studentId;
    private String studentName;
    private UUID schoolId;
    
    private LocalDateTime createdAt;
}

