package com.schoolms.repository;

import com.schoolms.entity.PasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetRepository extends JpaRepository<PasswordReset, UUID>, JpaSpecificationExecutor<PasswordReset> {
    
    Optional<PasswordReset> findByTokenHash(String tokenHash);
    
    List<PasswordReset> findByUserId(UUID userId);
    
    Optional<PasswordReset> findByUserIdAndTokenHashAndIsUsedFalse(UUID userId, String tokenHash);
    
    List<PasswordReset> findByExpiresAtBefore(LocalDateTime dateTime);
    
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}

