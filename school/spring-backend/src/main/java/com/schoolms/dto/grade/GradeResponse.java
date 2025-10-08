package com.schoolms.dto.grade;

import com.schoolms.enums.AssessmentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeResponse {
    
    private UUID id;
    private UUID studentId;
    private String studentName;
    private String studentIdNumber;
    private UUID subjectId;
    private String subjectName;
    private String subjectCode;
    private AssessmentType assessmentType;
    private String assessmentName;
    private LocalDate assessmentDate;
    private Double marksObtained;
    private Double totalMarks;
    private Double percentage;
    private String grade;
    private String remarks;
    private UUID gradedById;
    private String gradedByName;
    private UUID schoolId;
    private String schoolName;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

