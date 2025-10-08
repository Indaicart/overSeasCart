package com.schoolms.dto.school;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SchoolUpdateRequest {
    
    private String name;
    
    @Email(message = "Email must be valid")
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
}

