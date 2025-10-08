package com.schoolms.dto.grade;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeStatsResponse {
    
    private Long totalAssessments;
    private Double averageMarks;
    private Double averagePercentage;
    private Double highestMarks;
    private Double lowestMarks;
    private String mostCommonGrade;
}

