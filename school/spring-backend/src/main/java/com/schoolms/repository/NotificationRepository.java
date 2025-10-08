package com.schoolms.repository;

import com.schoolms.entity.Notification;
import com.schoolms.enums.NotificationCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID>, JpaSpecificationExecutor<Notification> {
    
    List<Notification> findByUserId(UUID userId);
    
    Page<Notification> findByUserId(UUID userId, Pageable pageable);
    
    List<Notification> findByUserIdAndIsRead(UUID userId, Boolean isRead);
    
    Page<Notification> findByUserIdAndIsRead(UUID userId, Boolean isRead, Pageable pageable);
    
    List<Notification> findByUserIdAndCategory(UUID userId, NotificationCategory category);
    
    long countByUserIdAndIsRead(UUID userId, Boolean isRead);
}

