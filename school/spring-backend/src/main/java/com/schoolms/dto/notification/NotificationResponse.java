package com.schoolms.dto.notification;

import com.schoolms.enums.NotificationCategory;
import com.schoolms.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    
    private UUID id;
    private UUID userId;
    private String userName;
    private NotificationType type;
    private NotificationCategory category;
    private String title;
    private String message;
    private Boolean isRead;
    private LocalDateTime readAt;
    private String link;
    private UUID schoolId;
    
    private LocalDateTime createdAt;
}

