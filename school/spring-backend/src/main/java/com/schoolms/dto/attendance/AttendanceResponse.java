package com.schoolms.dto.attendance;

import com.schoolms.enums.AttendanceStatus;
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
public class AttendanceResponse {
    
    private UUID id;
    private UUID studentId;
    private String studentName;
    private String studentIdNumber;
    private UUID classId;
    private String className;
    private String section;
    private UUID subjectId;
    private String subjectName;
    private LocalDate date;
    private AttendanceStatus status;
    private UUID markedById;
    private String markedByName;
    private String remarks;
    private UUID schoolId;
    private String schoolName;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

