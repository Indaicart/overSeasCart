package com.schoolms.dto.student;

import com.schoolms.enums.StudentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {
    
    private UUID id;
    private UUID userId;
    private String studentId;
    private String admissionNumber;
    private LocalDate admissionDate;
    private StudentStatus status;
    private UUID classId;
    private String className;
    private String section;
    private String rollNumber;
    private String bloodGroup;
    private String medicalConditions;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String notes;
    private UUID schoolId;
    private String schoolName;
    
    // User details
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String phone;
    private String address;
    private LocalDate dateOfBirth;
    private String gender;
    private String profileImage;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

