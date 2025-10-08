package com.schoolms.entity;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.time.LocalDate;
import java.util.Map;

@Entity
@Table(name = "schools", indexes = {
    @Index(name = "idx_schools_name", columnList = "name"),
    @Index(name = "idx_schools_school_code", columnList = "school_code")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class School extends BaseEntity {
    
    @Column(nullable = false, length = 255)
    private String name;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;
    
    @Column(length = 20)
    private String phone;
    
    @Column(length = 255)
    private String email;
    
    @Column(length = 255)
    private String website;
    
    @Column(length = 500)
    private String logo;
    
    @Column(name = "principal_name", length = 255)
    private String principalName;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "academic_year", nullable = false, length = 50)
    private String academicYear;
    
    @Column(name = "academic_year_start", nullable = false)
    private LocalDate academicYearStart;
    
    @Column(name = "academic_year_end", nullable = false)
    private LocalDate academicYearEnd;
    
    @Column(name = "school_code", unique = true, length = 20)
    private String schoolCode;
    
    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> settings;
}
