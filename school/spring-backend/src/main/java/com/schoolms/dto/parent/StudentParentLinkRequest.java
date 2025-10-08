package com.schoolms.dto.parent;

import com.schoolms.enums.RelationshipType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentParentLinkRequest {
    
    @NotNull(message = "Student ID is required")
    private UUID studentId;
    
    @NotNull(message = "Parent ID is required")
    private UUID parentId;
    
    @NotNull(message = "Relationship type is required")
    private RelationshipType relationshipType;
    
    private Boolean isPrimaryGuardian;
}

