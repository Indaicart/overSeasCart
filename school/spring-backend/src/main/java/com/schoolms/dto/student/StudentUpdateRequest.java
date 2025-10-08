package com.schoolms.dto.student;

import com.schoolms.enums.Gender;
import com.schoolms.enums.StudentStatus;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentUpdateRequest {
    
    // User details
    @Email(message = "Email must be valid")
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String profileImage;
    
    // Student details
    private StudentStatus status;
    private UUID classId;
    private String section;
    private String rollNumber;
    private String bloodGroup;
    private String medicalConditions;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String notes;
}

