package com.schoolms.dto.grade;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GradeUpdateRequest {
    
    private Double marksObtained;
    private Double totalMarks;
    private String grade;
    private String remarks;
}

