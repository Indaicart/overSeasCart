package com.schoolms.entity;

import com.schoolms.enums.SalaryPaymentMethod;
import com.schoolms.enums.SalaryPaymentStatus;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "salary_payments",
    uniqueConstraints = @UniqueConstraint(columnNames = {"teacher_id", "payment_month", "payment_year"}),
    indexes = {
        @Index(name = "idx_salary_payments_school", columnList = "school_id"),
        @Index(name = "idx_salary_payments_teacher", columnList = "teacher_id"),
        @Index(name = "idx_salary_payments_staff_salary", columnList = "staff_salary_id"),
        @Index(name = "idx_salary_payments_status", columnList = "payment_status"),
        @Index(name = "idx_salary_payments_month_year", columnList = "payment_month, payment_year"),
        @Index(name = "idx_salary_payments_date", columnList = "payment_date")
    }
)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class SalaryPayment extends BaseEntity {
    
    @Column(name = "school_id", nullable = false, columnDefinition = "UUID")
    private UUID schoolId;
    
    @Column(name = "teacher_id", nullable = false, columnDefinition = "UUID")
    private UUID teacherId;
    
    @Column(name = "staff_salary_id", nullable = false, columnDefinition = "UUID")
    private UUID staffSalaryId;
    
    // Payment period
    @Column(name = "payment_month", nullable = false)
    private Integer paymentMonth; // 1-12
    
    @Column(name = "payment_year", nullable = false)
    private Integer paymentYear;
    
    // Amounts
    @Column(name = "gross_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal grossAmount;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal deductions = BigDecimal.ZERO;
    
    @Column(name = "net_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal netAmount;
    
    @Column(name = "paid_amount", precision = 10, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;
    
    @Column(name = "pending_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal pendingAmount;
    
    // Payment details
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private SalaryPaymentMethod paymentMethod;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 20)
    private SalaryPaymentStatus paymentStatus = SalaryPaymentStatus.PENDING;
    
    @Column(name = "payment_date")
    private LocalDate paymentDate;
    
    @Column(name = "paid_by", columnDefinition = "UUID")
    private UUID paidBy;
    
    // Offline payment
    @Column(name = "offline_notes", columnDefinition = "TEXT")
    private String offlineNotes;
    
    @Column(name = "receipt_number", length = 100)
    private String receiptNumber;
    
    // Online payment (Razorpay)
    @Column(name = "payment_id", columnDefinition = "UUID")
    private UUID paymentId;
    
    @Column(name = "razorpay_order_id", length = 100)
    private String razorpayOrderId;
    
    @Column(name = "razorpay_payment_id", length = 100)
    private String razorpayPaymentId;
    
    // Salary slip
    @Type(JsonBinaryType.class)
    @Column(name = "salary_breakdown", columnDefinition = "jsonb")
    private Map<String, Object> salaryBreakdown;
    
    @Column(name = "slip_number", length = 100)
    private String slipNumber;
    
    @Column(name = "slip_generated")
    private Boolean slipGenerated = false;
    
    // Additional details
    @Column(name = "working_days")
    private Integer workingDays;
    
    @Column(name = "present_days")
    private Integer presentDays;
    
    @Column(name = "leave_days")
    private Integer leaveDays;
    
    @Column(name = "unpaid_leave_days", precision = 5, scale = 1)
    private BigDecimal unpaidLeaveDays = BigDecimal.ZERO;
    
    @Column(name = "unpaid_leave_deduction", precision = 10, scale = 2)
    private BigDecimal unpaidLeaveDeduction = BigDecimal.ZERO;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal bonus = BigDecimal.ZERO;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal penalty = BigDecimal.ZERO;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", insertable = false, updatable = false)
    private School school;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", insertable = false, updatable = false)
    private Teacher teacher;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_salary_id", insertable = false, updatable = false)
    private StaffSalary staffSalary;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paid_by", insertable = false, updatable = false)
    private User paidByUser;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", insertable = false, updatable = false)
    private Payment payment;
}

