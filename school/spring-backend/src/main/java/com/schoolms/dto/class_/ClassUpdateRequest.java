package com.schoolms.dto.class_;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassUpdateRequest {
    
    private String name;
    private String section;
    private Integer grade;
    private String academicYear;
    private UUID classTeacherId;
    private Integer capacity;
    private String roomNumber;
}

