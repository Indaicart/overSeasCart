package com.schoolms.dto.timetable;

import com.schoolms.enums.DayOfWeek;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimetableCreateRequest {
    
    @NotNull(message = "Class ID is required")
    private UUID classId;
    
    @NotNull(message = "Subject ID is required")
    private UUID subjectId;
    
    @NotNull(message = "Teacher ID is required")
    private UUID teacherId;
    
    @NotNull(message = "Day of week is required")
    private DayOfWeek dayOfWeek;
    
    @NotNull(message = "Start time is required")
    private LocalTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalTime endTime;
    
    private String roomNumber;
    
    @NotNull(message = "School ID is required")
    private UUID schoolId;
}

