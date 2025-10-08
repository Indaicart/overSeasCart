package com.schoolms.dto.attendance;

import com.schoolms.enums.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceUpdateRequest {
    
    private AttendanceStatus status;
    private String remarks;
}

