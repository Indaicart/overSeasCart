package com.schoolms.entity;

import com.schoolms.enums.NotificationCategory;
import com.schoolms.enums.NotificationType;
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
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notifications_user_read", columnList = "user_id, is_read"),
    @Index(name = "idx_notifications_created_at", columnList = "created_at"),
    @Index(name = "idx_notifications_category", columnList = "category")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Notification extends BaseEntity {
    
    @Column(name = "user_id", nullable = false, columnDefinition = "UUID")
    private UUID userId;
    
    @Column(nullable = false, length = 255)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private NotificationType type = NotificationType.INFO;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private NotificationCategory category = NotificationCategory.GENERAL;
    
    @Column(name = "is_read")
    private Boolean isRead = false;
    
    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> metadata;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
}

