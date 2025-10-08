package com.schoolms.dto.teacher;

import com.schoolms.enums.TeacherStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherResponse {
    
    private UUID id;
    private UUID userId;
    private String employeeId;
    private LocalDate joiningDate;
    private String qualification;
    private Integer experience;
    private String specialization;
    private TeacherStatus status;
    private Boolean isClassTeacher;
    private UUID classTeacherId;
    private String className;
    private String section;
    private String subjectsCSV;
    private List<UUID> subjectIds;
    private List<String> subjectNames;
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

