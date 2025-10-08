package com.schoolms.dto.user;

import com.schoolms.enums.Gender;
import com.schoolms.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    
    private UUID id;
    private String email;
    private UserRole role;
    private String firstName;
    private String lastName;
    private String fullName;
    private String phone;
    private String address;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String profileImage;
    private Boolean isActive;
    private LocalDateTime lastLogin;
    private UUID schoolId;
    private String schoolName;
    private Map<String, Object> permissions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

