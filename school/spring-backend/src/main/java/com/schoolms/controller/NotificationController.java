package com.schoolms.controller;

import com.schoolms.dto.notification.NotificationCreateRequest;
import com.schoolms.dto.notification.NotificationResponse;
import com.schoolms.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class NotificationController {
    
    private final NotificationService notificationService;
    
    @PostMapping
    public ResponseEntity<NotificationResponse> createNotification(@Valid @RequestBody NotificationCreateRequest request) {
        NotificationResponse response = notificationService.createNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getNotificationsByUser(@PathVariable UUID userId) {
        List<NotificationResponse> response = notificationService.getNotificationsByUser(userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/user/{userId}/page")
    public ResponseEntity<Page<NotificationResponse>> getNotificationsByUserPaginated(
            @PathVariable UUID userId, Pageable pageable) {
        Page<NotificationResponse> response = notificationService.getNotificationsByUser(userId, pageable);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(@PathVariable UUID userId) {
        List<NotificationResponse> response = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/user/{userId}/unread/count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable UUID userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(count);
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable UUID id) {
        NotificationResponse response = notificationService.markAsRead(id);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable UUID userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable UUID id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }
}

