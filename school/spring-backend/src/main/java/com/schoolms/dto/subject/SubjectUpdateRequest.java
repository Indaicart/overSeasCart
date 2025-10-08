package com.schoolms.dto.subject;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubjectUpdateRequest {
    
    private String name;
    private String code;
    private String description;
    private UUID classId;
    private Integer credits;
}

