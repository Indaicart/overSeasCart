package com.schoolms.dto.teacher;

import com.schoolms.enums.Gender;
import com.schoolms.enums.TeacherStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherCreateRequest {
    
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
    
    // Teacher details
    @NotBlank(message = "Employee ID is required")
    private String employeeId;
    
    @NotNull(message = "Joining date is required")
    private LocalDate joiningDate;
    
    private String qualification;
    private Integer experience;
    private String specialization;
    private TeacherStatus status;
    private Boolean isClassTeacher;
    private UUID classTeacherId;
    private List<UUID> subjectIds;
    
    @NotNull(message = "School ID is required")
    private UUID schoolId;
}

