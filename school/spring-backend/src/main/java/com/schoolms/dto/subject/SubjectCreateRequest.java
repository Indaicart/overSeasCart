package com.schoolms.dto.subject;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubjectCreateRequest {
    
    @NotBlank(message = "Subject name is required")
    private String name;
    
    @NotBlank(message = "Subject code is required")
    private String code;
    
    private String description;
    
    @NotNull(message = "Class ID is required")
    private UUID classId;
    
    private Integer credits;
    
    @NotNull(message = "School ID is required")
    private UUID schoolId;
}

