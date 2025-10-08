package com.schoolms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "features", indexes = {
    @Index(name = "idx_features_code", columnList = "code"),
    @Index(name = "idx_features_is_enabled", columnList = "is_enabled"),
    @Index(name = "idx_features_category", columnList = "category")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Feature extends BaseEntity {
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(unique = true, nullable = false, length = 50)
    private String code;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(length = 50)
    private String category;
    
    @Column(name = "is_enabled")
    private Boolean isEnabled = true;
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
}

