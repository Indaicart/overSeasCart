package com.schoolms.dto.timetable;

import com.schoolms.enums.DayOfWeek;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimetableResponse {
    
    private UUID id;
    private UUID classId;
    private String className;
    private UUID subjectId;
    private String subjectName;
    private UUID teacherId;
    private String teacherName;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String roomNumber;
    private UUID schoolId;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

