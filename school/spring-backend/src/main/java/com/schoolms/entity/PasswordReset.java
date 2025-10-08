package com.schoolms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "password_resets", indexes = {
    @Index(name = "idx_password_resets_user_id", columnList = "user_id"),
    @Index(name = "idx_password_resets_token_hash", columnList = "token_hash"),
    @Index(name = "idx_password_resets_expires_at", columnList = "expires_at")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class PasswordReset extends BaseEntity {
    
    @Column(name = "user_id", nullable = false, columnDefinition = "UUID")
    private UUID userId;
    
    @Column(name = "token_hash", nullable = false, length = 255)
    private String tokenHash;
    
    @Column(name = "verification_code", nullable = false, length = 10)
    private String verificationCode;
    
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(name = "is_used")
    private Boolean isUsed = false;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
}

