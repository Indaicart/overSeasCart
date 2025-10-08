package com.schoolms.entity;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "platform_admins", indexes = {
    @Index(name = "idx_platform_admins_user_id", columnList = "user_id")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class PlatformAdmin extends BaseEntity {
    
    @Column(name = "user_id", columnDefinition = "UUID")
    private UUID userId;
    
    @Column(name = "is_super_admin")
    private Boolean isSuperAdmin = true;
    
    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> permissions;
    
    @Column(name = "last_active")
    private LocalDateTime lastActive;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
}

