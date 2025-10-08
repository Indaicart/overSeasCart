package com.schoolms.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.schoolms.exception.ErrorResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * JWT Access Denied Handler
 * Handles authorization failures (403 Forbidden)
 */
@Component
@Slf4j
public class JwtAccessDeniedHandler implements AccessDeniedHandler {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException
    ) throws IOException, ServletException {
        log.error("Access denied: {}", accessDeniedException.getMessage());
        
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        
        ErrorResponse errorResponse = new ErrorResponse(
                HttpServletResponse.SC_FORBIDDEN,
                "Forbidden",
                "You don't have permission to access this resource",
                request.getRequestURI()
        );
        
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}

