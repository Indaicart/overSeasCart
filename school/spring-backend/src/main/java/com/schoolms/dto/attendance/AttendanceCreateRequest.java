package com.schoolms.dto.attendance;

import com.schoolms.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceCreateRequest {
    
    @NotNull(message = "Student ID is required")
    private UUID studentId;
    
    @NotNull(message = "Class ID is required")
    private UUID classId;
    
    private UUID subjectId; // Null for class attendance, set for subject attendance
    
    @NotNull(message = "Date is required")
    private LocalDate date;
    
    @NotNull(message = "Status is required")
    private AttendanceStatus status;
    
    @NotNull(message = "Marked by user ID is required")
    private UUID markedById;
    
    private String remarks;
    
    @NotNull(message = "School ID is required")
    private UUID schoolId;
}

