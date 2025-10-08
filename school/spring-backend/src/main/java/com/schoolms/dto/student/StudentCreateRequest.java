package com.schoolms.dto.student;

import com.schoolms.enums.Gender;
import com.schoolms.enums.StudentStatus;
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
public class StudentCreateRequest {
    
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
    
    private String phone;
    private String address;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String profileImage;
    
    // Student details
    @NotBlank(message = "Student ID is required")
    private String studentId;
    
    private String admissionNumber;
    
    @NotNull(message = "Admission date is required")
    private LocalDate admissionDate;
    
    private StudentStatus status;
    private UUID classId;
    private String section;
    private String rollNumber;
    private String bloodGroup;
    private String medicalConditions;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String notes;
    
    @NotNull(message = "School ID is required")
    private UUID schoolId;
}

