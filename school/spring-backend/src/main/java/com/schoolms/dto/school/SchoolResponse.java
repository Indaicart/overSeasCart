package com.schoolms.dto.school;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchoolResponse {
    
    private UUID id;
    private String name;
    private String schoolCode;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private String website;
    private String principalName;
    private String principalEmail;
    private String principalPhone;
    private String affiliationNumber;
    private String boardType;
    private String logo;
    private Boolean isActive;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

