package com.schoolms.dto.parent;

import com.schoolms.enums.Gender;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParentUpdateRequest {
    
    @Email(message = "Email must be valid")
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String profileImage;
    private String occupation;
    private String annualIncome;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;
}

