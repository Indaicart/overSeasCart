package com.schoolms.service;

import com.schoolms.dto.notification.NotificationCreateRequest;
import com.schoolms.dto.notification.NotificationResponse;
import com.schoolms.entity.Notification;
import com.schoolms.entity.User;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.repository.NotificationRepository;
import com.schoolms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public NotificationResponse createNotification(NotificationCreateRequest request) {
        log.info("Creating notification for user: {}", request.getUserId());
        
        userRepository.findById(request.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));
        
        Notification notification = new Notification();
        notification.setUserId(request.getUserId());
        notification.setType(request.getType());
        notification.setCategory(request.getCategory());
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setIsRead(false);
        notification.setLink(request.getLink());
        notification.setSchoolId(request.getSchoolId());
        
        notification = notificationRepository.save(notification);
        log.info("Notification created with ID: {}", notification.getId());
        return mapToResponse(notification);
    }
    
    public List<NotificationResponse> getNotificationsByUser(UUID userId) {
        List<Notification> notifications = notificationRepository.findByUserId(userId);
        return notifications.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    public Page<NotificationResponse> getNotificationsByUser(UUID userId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findByUserId(userId, pageable);
        return notifications.map(this::mapToResponse);
    }
    
    public List<NotificationResponse> getUnreadNotifications(UUID userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsRead(userId, false);
        return notifications.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }
    
    @Transactional
    public NotificationResponse markAsRead(UUID id) {
        Notification notification = notificationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        
        notification = notificationRepository.save(notification);
        return mapToResponse(notification);
    }
    
    @Transactional
    public void markAllAsRead(UUID userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsRead(userId, false);
        LocalDateTime now = LocalDateTime.now();
        
        unreadNotifications.forEach(notification -> {
            notification.setIsRead(true);
            notification.setReadAt(now);
        });
        
        notificationRepository.saveAll(unreadNotifications);
    }
    
    @Transactional
    public void deleteNotification(UUID id) {
        Notification notification = notificationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        notificationRepository.delete(notification);
    }
    
    private NotificationResponse mapToResponse(Notification notification) {
        NotificationResponse response = NotificationResponse.builder()
            .id(notification.getId())
            .userId(notification.getUserId())
            .type(notification.getType())
            .category(notification.getCategory())
            .title(notification.getTitle())
            .message(notification.getMessage())
            .isRead(notification.getIsRead())
            .readAt(notification.getReadAt())
            .link(notification.getLink())
            .schoolId(notification.getSchoolId())
            .createdAt(notification.getCreatedAt())
            .build();
        
        User user = userRepository.findById(notification.getUserId()).orElse(null);
        if (user != null) response.setUserName(user.getFullName());
        
        return response;
    }
}

