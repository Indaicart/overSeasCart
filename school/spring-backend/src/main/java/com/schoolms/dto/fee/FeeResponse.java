package com.schoolms.dto.fee;

import com.schoolms.enums.FeeStatus;
import com.schoolms.enums.FeeType;
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
public class FeeResponse {
    
    private UUID id;
    private UUID studentId;
    private String studentName;
    private String studentIdNumber;
    private FeeType feeType;
    private Double amount;
    private Double amountPaid;
    private Double amountDue;
    private FeeStatus status;
    private LocalDate dueDate;
    private LocalDate paidDate;
    private String academicYear;
    private String term;
    private String description;
    private UUID schoolId;
    private String schoolName;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

