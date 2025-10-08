package com.schoolms.dto.feature;

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
public class FeatureResponse {
    
    private UUID id;
    private String name;
    private String code;
    private String description;
    private String category;
    private Boolean isEnabled;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

