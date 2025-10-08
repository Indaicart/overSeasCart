package com.schoolms.dto.class_;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassCreateRequest {
    
    @NotBlank(message = "Class name is required")
    private String name;
    
    private String section;
    
    @NotNull(message = "Grade is required")
    private Integer grade;
    
    @NotBlank(message = "Academic year is required")
    private String academicYear;
    
    private UUID classTeacherId;
    private Integer capacity;
    private String roomNumber;
    
    @NotNull(message = "School ID is required")
    private UUID schoolId;
}

