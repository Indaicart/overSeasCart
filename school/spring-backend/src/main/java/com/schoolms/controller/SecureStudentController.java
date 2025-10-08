package com.schoolms.controller;

import com.schoolms.dto.student.StudentCreateRequest;
import com.schoolms.dto.student.StudentResponse;
import com.schoolms.dto.student.StudentUpdateRequest;
import com.schoolms.security.annotation.RequireRole;
import com.schoolms.security.annotation.RequireSchoolAccess;
import com.schoolms.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.UUID;

/**
 * EXAMPLE Controller with Spring Security annotations
 * Demonstrates 3 ways to secure endpoints:
 * 1. @PreAuthorize - Spring Security native
 * 2. @RequireRole - Custom annotation
 * 3. @RequireSchoolAccess - Multi-tenant protection
 * 
 * This is for reference - the actual StudentController will be updated similarly
 */
@RestController
@RequestMapping("/api/secure/students")
@RequiredArgsConstructor
public class SecureStudentController {
    
    private final StudentService studentService;
    
    /**
     * Method 1: Using @PreAuthorize (Spring Security native)
     * Most common approach
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER', 'SUPER_ADMIN')")
    public ResponseEntity<Page<StudentResponse>> getAllStudents(
            @RequestParam UUID schoolId,
            Pageable pageable
    ) {
        Page<StudentResponse> students = studentService.getStudentsBySchool(schoolId, pageable);
        return ResponseEntity.ok(students);
    }
    
    /**
     * Method 2: Using custom @RequireRole annotation
     * Cleaner syntax for role checking
     */
    @GetMapping("/{id}")
    @RequireRole({"SCHOOL_ADMIN", "CLASS_TEACHER", "SUBJECT_TEACHER"})
    public ResponseEntity<StudentResponse> getStudentById(@PathVariable UUID id) {
        StudentResponse student = studentService.getStudentById(id);
        return ResponseEntity.ok(student);
    }
    
    /**
     * Method 3: Using @RequireSchoolAccess
     * Automatically validates that user can only access their own school's data
     * Super Admin can bypass this check
     */
    @PostMapping
    @RequireSchoolAccess(allowSuperAdmin = true)
    @RequireRole({"SCHOOL_ADMIN", "SUPER_ADMIN"})
    public ResponseEntity<StudentResponse> createStudent(
            @Valid @RequestBody StudentCreateRequest request
    ) {
        StudentResponse student = studentService.createStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(student);
    }
    
    /**
     * Combining multiple security annotations
     */
    @PutMapping("/{id}")
    @RequireSchoolAccess
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<StudentResponse> updateStudent(
            @PathVariable UUID id,
            @Valid @RequestBody StudentUpdateRequest request
    ) {
        StudentResponse student = studentService.updateStudent(id, request);
        return ResponseEntity.ok(student);
    }
    
    /**
     * Delete - most restrictive (only School Admin and Super Admin)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteStudent(@PathVariable UUID id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}

