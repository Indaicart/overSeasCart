package com.schoolms.entity;

import com.schoolms.enums.Gender;
import com.schoolms.enums.UserRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_email", columnList = "email"),
    @Index(name = "idx_users_role", columnList = "role"),
    @Index(name = "idx_users_school_id", columnList = "school_id"),
    @Index(name = "idx_users_is_active", columnList = "is_active")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity {
    
    @Column(nullable = false, unique = true, length = 255)
    private String email;
    
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;
    
    @Column(name = "first_name", nullable = false, length = 255)
    private String firstName;
    
    @Column(name = "last_name", nullable = false, length = 255)
    private String lastName;
    
    @Column(length = 20)
    private String phone;
    
    @Column(columnDefinition = "TEXT")
    private String address;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender;
    
    @Column(name = "profile_image", length = 500)
    private String profileImage;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    @Column(name = "school_id", columnDefinition = "UUID")
    private UUID schoolId;
    
    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> permissions;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", insertable = false, updatable = false)
    private School school;
    
    // Helper methods
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    public boolean isSuperAdmin() {
        return UserRole.SUPER_ADMIN.equals(role);
    }
    
    public boolean isAdmin() {
        return UserRole.ADMIN.equals(role);
    }
    
    public boolean isTeacher() {
        return UserRole.TEACHER.equals(role);
    }
    
    public boolean isStudent() {
        return UserRole.STUDENT.equals(role);
    }
    
    public boolean isParent() {
        return UserRole.PARENT.equals(role);
    }
}
