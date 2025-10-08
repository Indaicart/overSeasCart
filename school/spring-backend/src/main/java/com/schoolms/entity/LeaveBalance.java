package com.schoolms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "leave_balances",
    uniqueConstraints = @UniqueConstraint(columnNames = {"teacher_id", "leave_type_id", "year"}),
    indexes = {
        @Index(name = "idx_leave_balances_school_teacher_year", columnList = "school_id, teacher_id, year")
    }
)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalance extends BaseEntity {
    
    @Column(name = "school_id", nullable = false, columnDefinition = "UUID")
    private UUID schoolId;
    
    @Column(name = "teacher_id", nullable = false, columnDefinition = "UUID")
    private UUID teacherId;
    
    @Column(name = "leave_type_id", nullable = false, columnDefinition = "UUID")
    private UUID leaveTypeId;
    
    @Column(nullable = false)
    private Integer year;
    
    @Column(nullable = false, precision = 5, scale = 1)
    private BigDecimal allocated;
    
    @Column(precision = 5, scale = 1)
    private BigDecimal used = BigDecimal.ZERO;
    
    @Column(precision = 5, scale = 1)
    private BigDecimal pending = BigDecimal.ZERO;
    
    @Column(nullable = false, precision = 5, scale = 1)
    private BigDecimal available;
    
    @Column(name = "carried_forward", precision = 5, scale = 1)
    private BigDecimal carriedForward = BigDecimal.ZERO;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", insertable = false, updatable = false)
    private School school;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", insertable = false, updatable = false)
    private Teacher teacher;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_type_id", insertable = false, updatable = false)
    private LeaveType leaveType;
}

