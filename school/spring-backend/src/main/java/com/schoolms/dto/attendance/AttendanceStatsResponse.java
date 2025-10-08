package com.schoolms.dto.attendance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceStatsResponse {
    
    private Long totalDays;
    private Long presentDays;
    private Long absentDays;
    private Long lateDays;
    private Long excusedDays;
    private Double attendancePercentage;
}

