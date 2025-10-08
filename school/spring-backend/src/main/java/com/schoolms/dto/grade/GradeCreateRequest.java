package com.schoolms.dto.grade;

import com.schoolms.enums.AssessmentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GradeCreateRequest {
    
    @NotNull(message = "Student ID is required")
    private UUID studentId;
    
    @NotNull(message = "Subject ID is required")
    private UUID subjectId;
    
    @NotNull(message = "Assessment type is required")
    private AssessmentType assessmentType;
    
    @NotBlank(message = "Assessment name is required")
    private String assessmentName;
    
    @NotNull(message = "Assessment date is required")
    private LocalDate assessmentDate;
    
    @NotNull(message = "Marks obtained is required")
    private Double marksObtained;
    
    @NotNull(message = "Total marks is required")
    private Double totalMarks;
    
    private String grade;
    private String remarks;
    
    @NotNull(message = "Graded by user ID is required")
    private UUID gradedById;
    
    @NotNull(message = "School ID is required")
    private UUID schoolId;
}

