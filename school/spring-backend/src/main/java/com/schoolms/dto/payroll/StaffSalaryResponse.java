package com.schoolms.dto.payroll;

import com.schoolms.enums.EmploymentType;
import com.schoolms.enums.PaymentFrequency;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffSalaryResponse {
    
    private UUID id;
    private UUID teacherId;
    private String teacherName;
    private String employeeId;
    private Double basicSalary;
    private Double allowances;
    private Double deductions;
    private Double netSalary;
    private PaymentFrequency paymentFrequency;
    private EmploymentType employmentType;
    private String bankAccountNumber;
    private String bankName;
    private String ifscCode;
    private UUID schoolId;
    private String schoolName;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

