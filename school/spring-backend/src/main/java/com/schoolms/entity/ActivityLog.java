package com.schoolms.entity;

import com.schoolms.enums.LogAction;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "activity_logs", indexes = {
    @Index(name = "idx_activity_logs_school", columnList = "school_id"),
    @Index(name = "idx_activity_logs_user", columnList = "user_id"),
    @Index(name = "idx_activity_logs_entity", columnList = "entity_type, entity_id"),
    @Index(name = "idx_activity_logs_created_at", columnList = "created_at")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLog extends BaseEntity {
    
    @Column(name = "school_id", columnDefinition = "UUID")
    private UUID schoolId;
    
    @Column(name = "user_id", columnDefinition = "UUID")
    private UUID userId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LogAction action;
    
    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType;
    
    @Column(name = "entity_id", columnDefinition = "UUID")
    private UUID entityId;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "ip_address", length = 45)
    private String ipAddress;
    
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;
    
    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> metadata;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", insertable = false, updatable = false)
    private School school;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
}

