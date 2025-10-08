package com.schoolms.dto.leave;

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
public class LeaveApplicationCreateRequest {
    
    @NotNull(message = "Teacher ID is required")
    private UUID teacherId;
    
    @NotNull(message = "Leave type ID is required")
    private UUID leaveTypeId;
    
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    
    @NotNull(message = "End date is required")
    private LocalDate endDate;
    
    @NotBlank(message = "Reason is required")
    private String reason;
    
    @NotNull(message = "School ID is required")
    private UUID schoolId;
}

