package com.schoolms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "plan_features",
    uniqueConstraints = @UniqueConstraint(columnNames = {"plan_id", "feature_id"}),
    indexes = {
        @Index(name = "idx_plan_features_plan_id", columnList = "plan_id"),
        @Index(name = "idx_plan_features_feature_id", columnList = "feature_id")
    }
)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class PlanFeature extends BaseEntity {
    
    @Column(name = "plan_id", nullable = false, columnDefinition = "UUID")
    private UUID planId;
    
    @Column(name = "feature_id", nullable = false, columnDefinition = "UUID")
    private UUID featureId;
    
    @Column(name = "is_enabled")
    private Boolean isEnabled = true;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", insertable = false, updatable = false)
    private SubscriptionPlan plan;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feature_id", insertable = false, updatable = false)
    private Feature feature;
}

