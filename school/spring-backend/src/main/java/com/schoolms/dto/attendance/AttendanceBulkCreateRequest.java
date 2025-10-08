package com.schoolms.dto.attendance;

import com.schoolms.enums.AttendanceStatus;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceBulkCreateRequest {
    
    @NotNull(message = "Class ID is required")
    private UUID classId;
    
    private UUID subjectId; // Null for class attendance, set for subject attendance
    
    @NotNull(message = "Date is required")
    private LocalDate date;
    
    @NotNull(message = "Marked by user ID is required")
    private UUID markedById;
    
    @NotEmpty(message = "Student attendance list cannot be empty")
    private List<StudentAttendance> students;
    
    @NotNull(message = "School ID is required")
    private UUID schoolId;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentAttendance {
        @NotNull(message = "Student ID is required")
        private UUID studentId;
        
        @NotNull(message = "Status is required")
        private AttendanceStatus status;
        
        private String remarks;
    }
}

