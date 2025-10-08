package com.schoolms.dto.feature;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanFeatureResponse {
    
    private UUID planId;
    private String planName;
    private UUID featureId;
    private String featureName;
    private Boolean isEnabled;
}

