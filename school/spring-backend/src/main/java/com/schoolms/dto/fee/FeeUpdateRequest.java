package com.schoolms.dto.fee;

import com.schoolms.enums.FeeStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeeUpdateRequest {
    
    private Double amount;
    private LocalDate dueDate;
    private FeeStatus status;
    private String description;
}

