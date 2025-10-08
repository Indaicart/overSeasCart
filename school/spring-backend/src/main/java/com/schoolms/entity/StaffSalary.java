package com.schoolms.entity;

import com.schoolms.enums.PaymentFrequency;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "staff_salaries",
    uniqueConstraints = @UniqueConstraint(columnNames = {"teacher_id", "effective_from"}),
    indexes = {
        @Index(name = "idx_staff_salaries_school", columnList = "school_id"),
        @Index(name = "idx_staff_salaries_teacher", columnList = "teacher_id"),
        @Index(name = "idx_staff_salaries_active", columnList = "is_active"),
        @Index(name = "idx_staff_salaries_effective_from", columnList = "effective_from")
    }
)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class StaffSalary extends BaseEntity {
    
    @Column(name = "school_id", nullable = false, columnDefinition = "UUID")
    private UUID schoolId;
    
    @Column(name = "teacher_id", nullable = false, columnDefinition = "UUID")
    private UUID teacherId;
    
    // Salary Components
    @Column(name = "basic_salary", nullable = false, precision = 10, scale = 2)
    private BigDecimal basicSalary;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal hra = BigDecimal.ZERO;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal da = BigDecimal.ZERO;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal ta = BigDecimal.ZERO;
    
    @Column(name = "medical_allowance", precision = 10, scale = 2)
    private BigDecimal medicalAllowance = BigDecimal.ZERO;
    
    @Column(name = "other_allowances", precision = 10, scale = 2)
    private BigDecimal otherAllowances = BigDecimal.ZERO;
    
    // Deductions
    @Column(precision = 10, scale = 2)
    private BigDecimal pf = BigDecimal.ZERO;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal esi = BigDecimal.ZERO;
    
    @Column(name = "professional_tax", precision = 10, scale = 2)
    private BigDecimal professionalTax = BigDecimal.ZERO;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal tds = BigDecimal.ZERO;
    
    @Column(name = "other_deductions", precision = 10, scale = 2)
    private BigDecimal otherDeductions = BigDecimal.ZERO;
    
    // Calculated fields
    @Column(name = "gross_salary", nullable = false, precision = 10, scale = 2)
    private BigDecimal grossSalary;
    
    @Column(name = "net_salary", nullable = false, precision = 10, scale = 2)
    private BigDecimal netSalary;
    
    // Payment details
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_frequency", length = 20)
    private PaymentFrequency paymentFrequency = PaymentFrequency.MONTHLY;
    
    @Column(name = "pay_day")
    private Integer payDay = 1;
    
    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;
    
    @Column(name = "effective_to")
    private LocalDate effectiveTo;
    
    // Bank details
    @Column(name = "bank_name", length = 100)
    private String bankName;
    
    @Column(name = "account_number", length = 50)
    private String accountNumber;
    
    @Column(name = "ifsc_code", length = 20)
    private String ifscCode;
    
    @Column(name = "account_holder_name", length = 100)
    private String accountHolderName;
    
    @Column(name = "pan_number", length = 20)
    private String panNumber;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", insertable = false, updatable = false)
    private School school;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", insertable = false, updatable = false)
    private Teacher teacher;
}

