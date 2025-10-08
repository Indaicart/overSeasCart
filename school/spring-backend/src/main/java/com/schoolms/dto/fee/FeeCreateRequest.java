package com.schoolms.dto.fee;

import com.schoolms.enums.FeeStatus;
import com.schoolms.enums.FeeType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeeCreateRequest {
    
    @NotNull(message = "Student ID is required")
    private UUID studentId;
    
    @NotNull(message = "Fee type is required")
    private FeeType feeType;
    
    @NotNull(message = "Amount is required")
    private Double amount;
    
    @NotNull(message = "Due date is required")
    private LocalDate dueDate;
    
    @NotNull(message = "Academic year is required")
    private String academicYear;
    
    private String term;
    private String description;
    
    @NotNull(message = "School ID is required")
    private UUID schoolId;
}

