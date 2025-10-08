package com.schoolms.dto.document;

import com.schoolms.enums.DocumentCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentCreateRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotNull(message = "Category is required")
    private DocumentCategory category;
    
    @NotBlank(message = "File name is required")
    private String fileName;
    
    @NotBlank(message = "File path is required")
    private String filePath;
    
    @NotBlank(message = "File type is required")
    private String fileType;
    
    @NotNull(message = "File size is required")
    private Long fileSize;
    
    @NotNull(message = "Uploaded by user ID is required")
    private UUID uploadedById;
    
    private UUID studentId;
    
    @NotNull(message = "School ID is required")
    private UUID schoolId;
}

