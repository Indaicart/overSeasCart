package com.schoolms.dto.notification;

import com.schoolms.enums.NotificationCategory;
import com.schoolms.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationCreateRequest {
    
    @NotNull(message = "User ID is required")
    private UUID userId;
    
    @NotNull(message = "Notification type is required")
    private NotificationType type;
    
    @NotNull(message = "Category is required")
    private NotificationCategory category;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Message is required")
    private String message;
    
    private String link;
    
    @NotNull(message = "School ID is required")
    private UUID schoolId;
}

