package com.schoolms.security.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Custom annotation for role-based access control
 * Can be used at method level for fine-grained authorization
 * 
 * Usage:
 * @RequireRole({"SCHOOL_ADMIN", "SUPER_ADMIN"})
 * public void someMethod() { ... }
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireRole {
    String[] value();
}

