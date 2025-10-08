package com.schoolms.dto.teacher;

import com.schoolms.enums.Gender;
import com.schoolms.enums.TeacherStatus;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherUpdateRequest {
    
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
    
    // Teacher details
    private String qualification;
    private Integer experience;
    private String specialization;
    private TeacherStatus status;
    private Boolean isClassTeacher;
    private UUID classTeacherId;
    private List<UUID> subjectIds;
}

