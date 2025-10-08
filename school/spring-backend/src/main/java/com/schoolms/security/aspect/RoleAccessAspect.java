package com.schoolms.security.aspect;

import com.schoolms.exception.UnauthorizedException;
import com.schoolms.security.SecurityContextHelper;
import com.schoolms.security.annotation.RequireRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;

/**
 * AOP Aspect for @RequireRole annotation
 * Validates that users have one of the required roles
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class RoleAccessAspect {
    
    private final SecurityContextHelper securityContextHelper;
    
    @Around("@annotation(com.schoolms.security.annotation.RequireRole)")
    public Object validateRoleAccess(ProceedingJoinPoint joinPoint) throws Throwable {
        // Get the annotation
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        RequireRole annotation = method.getAnnotation(RequireRole.class);
        
        // Get required roles
        String[] requiredRoles = annotation.value();
        
        // Get current user's role
        String userRole = securityContextHelper.getCurrentUserRole();
        
        if (userRole == null) {
            throw new UnauthorizedException("User role not found");
        }
        
        // Check if user has one of the required roles
        boolean hasAccess = Arrays.asList(requiredRoles).contains(userRole);
        
        if (!hasAccess) {
            log.warn("Role access violation: User role={}, Required roles={}", 
                    userRole, Arrays.toString(requiredRoles));
            throw new UnauthorizedException(
                    "You don't have permission to access this resource. Required roles: " + 
                    Arrays.toString(requiredRoles)
            );
        }
        
        return joinPoint.proceed();
    }
}

