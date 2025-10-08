package com.schoolms.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private String token;
    private UserResponse user;
    
    @Data
    @Builder
    public static class UserResponse {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private String role;
        private Long schoolId;
    }
}
