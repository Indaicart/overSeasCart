package com.schoolms.entity;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.math.BigDecimal;
import java.util.Map;

@Entity
@Table(name = "subscription_plans", indexes = {
    @Index(name = "idx_subscription_plans_code", columnList = "code"),
    @Index(name = "idx_subscription_plans_is_active", columnList = "is_active")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlan extends BaseEntity {
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(unique = true, nullable = false, length = 20)
    private String code;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "monthly_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal monthlyPrice;
    
    @Column(name = "annual_price", precision = 10, scale = 2)
    private BigDecimal annualPrice;
    
    @Column(name = "max_students")
    private Integer maxStudents = 100;
    
    @Column(name = "max_teachers")
    private Integer maxTeachers = 20;
    
    @Column(name = "max_storage_gb")
    private Integer maxStorageGb = 5;
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> features;
}

