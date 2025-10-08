package com.schoolms.dto.school;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SchoolCreateRequest {
    
    @NotBlank(message = "School name is required")
    private String name;
    
    @NotBlank(message = "School code is required")
    private String schoolCode;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    @NotBlank(message = "Phone is required")
    private String phone;
    
    @NotBlank(message = "Address is required")
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
}

