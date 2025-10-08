package com.schoolms.dto.class_;

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
public class ClassResponse {
    
    private UUID id;
    private String name;
    private String section;
    private Integer grade;
    private String academicYear;
    private UUID classTeacherId;
    private String classTeacherName;
    private String classTeacherEmployeeId;
    private Integer capacity;
    private String roomNumber;
    private UUID schoolId;
    private String schoolName;
    private Long studentCount;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

