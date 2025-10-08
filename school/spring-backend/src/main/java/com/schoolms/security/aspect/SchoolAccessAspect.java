package com.schoolms.security.aspect;

import com.schoolms.exception.UnauthorizedException;
import com.schoolms.security.SecurityContextHelper;
import com.schoolms.security.annotation.RequireSchoolAccess;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.UUID;

/**
 * AOP Aspect for @RequireSchoolAccess annotation
 * Validates that users can only access data from their own school
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class SchoolAccessAspect {
    
    private final SecurityContextHelper securityContextHelper;
    
    @Around("@annotation(com.schoolms.security.annotation.RequireSchoolAccess)")
    public Object validateSchoolAccess(ProceedingJoinPoint joinPoint) throws Throwable {
        // Get the annotation
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        RequireSchoolAccess annotation = method.getAnnotation(RequireSchoolAccess.class);
        
        // Check if Super Admin can bypass
        if (annotation.allowSuperAdmin() && securityContextHelper.isSuperAdmin()) {
            log.debug("Super Admin bypassing school access check");
            return joinPoint.proceed();
        }
        
        // Get current user's school ID
        UUID userSchoolId = securityContextHelper.getCurrentSchoolId();
        
        if (userSchoolId == null) {
            throw new UnauthorizedException("User is not associated with any school");
        }
        
        // Find schoolId parameter in method arguments
        UUID requestedSchoolId = extractSchoolIdFromArguments(joinPoint);
        
        // Validate school access
        if (requestedSchoolId != null && !userSchoolId.equals(requestedSchoolId)) {
            log.warn("School access violation: User school={}, Requested school={}", 
                    userSchoolId, requestedSchoolId);
            throw new UnauthorizedException("You don't have permission to access data from this school");
        }
        
        return joinPoint.proceed();
    }
    
    /**
     * Extract schoolId from method arguments
     * Looks for parameters named 'schoolId' or of type UUID in path
     */
    private UUID extractSchoolIdFromArguments(ProceedingJoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        Parameter[] parameters = method.getParameters();
        Object[] args = joinPoint.getArgs();
        
        for (int i = 0; i < parameters.length; i++) {
            Parameter parameter = parameters[i];
            
            // Check if parameter is named 'schoolId'
            if (parameter.getName().equals("schoolId") && args[i] instanceof UUID) {
                return (UUID) args[i];
            }
        }
        
        return null;
    }
}

