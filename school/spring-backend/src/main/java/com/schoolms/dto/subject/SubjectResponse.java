package com.schoolms.dto.subject;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectResponse {
    
    private UUID id;
    private String name;
    private String code;
    private String description;
    private UUID classId;
    private String className;
    private String section;
    private Integer grade;
    private Integer credits;
    private UUID schoolId;
    private String schoolName;
    private List<UUID> teacherIds;
    private List<String> teacherNames;
    private Long studentCount;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

