package com.schoolms.dto.user;

import com.schoolms.enums.Gender;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {
    
    @Email(message = "Email must be valid")
    private String email;
    
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String profileImage;
    private Boolean isActive;
    private Map<String, Object> permissions;
}

