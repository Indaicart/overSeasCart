package com.schoolms.dto.parent;

import com.schoolms.enums.RelationshipType;
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
public class ParentResponse {
    
    private UUID id;
    private UUID userId;
    private String occupation;
    private String annualIncome;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;
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
    
    // Children details
    private List<ChildInfo> children;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChildInfo {
        private UUID studentId;
        private String studentName;
        private String studentIdNumber;
        private String className;
        private RelationshipType relationship;
        private Boolean isPrimaryGuardian;
    }
}

