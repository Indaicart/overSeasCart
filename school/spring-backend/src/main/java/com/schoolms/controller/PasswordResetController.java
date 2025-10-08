package com.schoolms.controller;

import com.schoolms.service.PasswordResetService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/password-reset")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PasswordResetController {
    
    private final PasswordResetService passwordResetService;
    
    @PostMapping("/initiate")
    public ResponseEntity<Map<String, String>> initiatePasswordReset(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String verificationCode = passwordResetService.initiatePasswordReset(email);
        
        // In production, don't return the code - send via email
        return ResponseEntity.ok(Map.of(
            "message", "Verification code sent to email",
            "verificationCode", verificationCode  // Remove this in production
        ));
    }
    
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Boolean>> verifyCode(@RequestBody VerifyCodeRequest request) {
        boolean isValid = passwordResetService.verifyCode(request.getEmail(), request.getVerificationCode());
        return ResponseEntity.ok(Map.of("valid", isValid));
    }
    
    @PostMapping("/reset")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getEmail(), request.getVerificationCode(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyCodeRequest {
        private String email;
        private String verificationCode;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResetPasswordRequest {
        private String email;
        private String verificationCode;
        private String newPassword;
    }
}

