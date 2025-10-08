package com.schoolms.dto.parent;

import com.schoolms.enums.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParentCreateRequest {
    
    // User details
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    @NotBlank(message = "First name is required")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    @NotBlank(message = "Phone is required")
    private String phone;
    
    private String address;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String profileImage;
    
    // Parent details
    private String occupation;
    private String annualIncome;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;
    
    @NotNull(message = "School ID is required")
    private UUID schoolId;
}

