package com.schoolms.security.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Custom annotation to enforce school-level data access
 * Ensures users can only access data from their own school
 * 
 * Usage:
 * @RequireSchoolAccess
 * public void getStudents(@PathVariable UUID schoolId) { ... }
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireSchoolAccess {
    /**
     * Whether to allow Super Admin to bypass this check
     */
    boolean allowSuperAdmin() default true;
}

