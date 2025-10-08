package com.schoolms.entity;

import com.schoolms.enums.BillingCycle;
import com.schoolms.enums.PlanType;
import com.schoolms.enums.SubscriptionStatus;
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
@Table(name = "subscriptions", indexes = {
    @Index(name = "idx_subscriptions_school", columnList = "school_id"),
    @Index(name = "idx_subscriptions_status", columnList = "status"),
    @Index(name = "idx_subscriptions_plan_type", columnList = "plan_type")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Subscription extends BaseEntity {
    
    @Column(name = "school_id", columnDefinition = "UUID")
    private UUID schoolId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "plan_type", nullable = false, length = 20)
    private PlanType planType;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private SubscriptionStatus status = SubscriptionStatus.TRIAL;
    
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
    @Column(name = "trial_end_date")
    private LocalDate trialEndDate;
    
    @Column(name = "monthly_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal monthlyPrice;
    
    @Column(name = "annual_price", precision = 10, scale = 2)
    private BigDecimal annualPrice;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle", length = 20)
    private BillingCycle billingCycle = BillingCycle.MONTHLY;
    
    @Column(name = "max_students")
    private Integer maxStudents = 100;
    
    @Column(name = "max_teachers")
    private Integer maxTeachers = 20;
    
    @Column(name = "max_storage_gb")
    private Integer maxStorageGb = 5;
    
    @Column(name = "has_advanced_analytics")
    private Boolean hasAdvancedAnalytics = false;
    
    @Column(name = "has_custom_branding")
    private Boolean hasCustomBranding = false;
    
    @Column(name = "has_api_access")
    private Boolean hasApiAccess = false;
    
    @Column(name = "has_priority_support")
    private Boolean hasPrioritySupport = false;
    
    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> features;
    
    @Column(name = "stripe_subscription_id", length = 255)
    private String stripeSubscriptionId;
    
    @Column(name = "stripe_customer_id", length = 255)
    private String stripeCustomerId;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", insertable = false, updatable = false)
    private School school;
}

