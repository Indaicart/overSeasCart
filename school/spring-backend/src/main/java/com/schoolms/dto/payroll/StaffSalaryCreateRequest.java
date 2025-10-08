package com.schoolms.dto.payroll;

import com.schoolms.enums.EmploymentType;
import com.schoolms.enums.PaymentFrequency;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffSalaryCreateRequest {
    
    @NotNull(message = "Teacher ID is required")
    private UUID teacherId;
    
    @NotNull(message = "Basic salary is required")
    private Double basicSalary;
    
    private Double allowances;
    private Double deductions;
    
    @NotNull(message = "Payment frequency is required")
    private PaymentFrequency paymentFrequency;
    
    @NotNull(message = "Employment type is required")
    private EmploymentType employmentType;
    
    private String bankAccountNumber;
    private String bankName;
    private String ifscCode;
    
    @NotNull(message = "School ID is required")
    private UUID schoolId;
}

