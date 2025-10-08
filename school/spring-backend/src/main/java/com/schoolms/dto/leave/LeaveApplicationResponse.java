package com.schoolms.dto.leave;

import com.schoolms.enums.LeaveApplicationStatus;
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
public class LeaveApplicationResponse {
    
    private UUID id;
    private UUID teacherId;
    private String teacherName;
    private UUID leaveTypeId;
    private String leaveTypeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalDays;
    private String reason;
    private LeaveApplicationStatus status;
    private UUID approvedById;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private String approvalRemarks;
    private UUID schoolId;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

