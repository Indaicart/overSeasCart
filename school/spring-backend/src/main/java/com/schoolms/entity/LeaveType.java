package com.schoolms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "leave_types",
    uniqueConstraints = @UniqueConstraint(columnNames = {"school_id", "code"}),
    indexes = {
        @Index(name = "idx_leave_types_school_active", columnList = "school_id, is_active")
    }
)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class LeaveType extends BaseEntity {
    
    @Column(name = "school_id", nullable = false, columnDefinition = "UUID")
    private UUID schoolId;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(nullable = false, length = 20)
    private String code;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "annual_quota", nullable = false)
    private Integer annualQuota;
    
    @Column(name = "is_paid")
    private Boolean isPaid = true;
    
    @Column(name = "requires_approval")
    private Boolean requiresApproval = true;
    
    @Column(name = "allow_half_day")
    private Boolean allowHalfDay = true;
    
    @Column(name = "can_carry_forward")
    private Boolean canCarryForward = false;
    
    @Column(name = "max_carry_forward_days")
    private Integer maxCarryForwardDays = 0;
    
    @Column(name = "min_days_notice")
    private Integer minDaysNotice = 0;
    
    @Column(name = "max_consecutive_days")
    private Integer maxConsecutiveDays;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", insertable = false, updatable = false)
    private School school;
}

