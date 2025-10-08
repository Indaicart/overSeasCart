package com.schoolms.service;

import com.schoolms.entity.PasswordReset;
import com.schoolms.entity.User;
import com.schoolms.exception.BadRequestException;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.repository.PasswordResetRepository;
import com.schoolms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {
    
    private final PasswordResetRepository passwordResetRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Transactional
    public String initiatePasswordReset(String email) {
        log.info("Initiating password reset for email: {}", email);
        
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        
        // Generate 6-digit code
        String verificationCode = generateVerificationCode();
        
        // Generate token (hashed)
        String token = generateToken();
        String hashedToken = hashToken(token);
        
        // Invalidate any existing reset requests
        passwordResetRepository.deleteByUserId(user.getId());
        
        // Create new reset request
        PasswordReset passwordReset = new PasswordReset();
        passwordReset.setUserId(user.getId());
        passwordReset.setToken(hashedToken);
        passwordReset.setVerificationCode(verificationCode);
        passwordReset.setExpiresAt(LocalDateTime.now().plusMinutes(15)); // 15 minutes expiry
        passwordReset.setIsUsed(false);
        
        passwordResetRepository.save(passwordReset);
        
        log.info("Password reset initiated for user: {}", user.getId());
        
        // In production, send email with verificationCode
        // For now, return it (remove this in production)
        return verificationCode;
    }
    
    @Transactional
    public boolean verifyCode(String email, String verificationCode) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        
        PasswordReset passwordReset = passwordResetRepository.findByUserId(user.getId())
            .orElseThrow(() -> new BadRequestException("No password reset request found"));
        
        if (passwordReset.getIsUsed()) {
            throw new BadRequestException("This reset link has already been used");
        }
        
        if (passwordReset.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This reset link has expired");
        }
        
        if (!passwordReset.getVerificationCode().equals(verificationCode)) {
            throw new BadRequestException("Invalid verification code");
        }
        
        return true;
    }
    
    @Transactional
    public void resetPassword(String email, String verificationCode, String newPassword) {
        log.info("Resetting password for email: {}", email);
        
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        
        PasswordReset passwordReset = passwordResetRepository.findByUserId(user.getId())
            .orElseThrow(() -> new BadRequestException("No password reset request found"));
        
        if (passwordReset.getIsUsed()) {
            throw new BadRequestException("This reset link has already been used");
        }
        
        if (passwordReset.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This reset link has expired");
        }
        
        if (!passwordReset.getVerificationCode().equals(verificationCode)) {
            throw new BadRequestException("Invalid verification code");
        }
        
        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Mark as used
        passwordReset.setIsUsed(true);
        passwordResetRepository.save(passwordReset);
        
        log.info("Password reset successfully for user: {}", user.getId());
    }
    
    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 6-digit code
        return String.valueOf(code);
    }
    
    private String generateToken() {
        return UUID.randomUUID().toString();
    }
    
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }
}

