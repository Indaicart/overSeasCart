package com.schoolms.security;

import com.schoolms.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

/**
 * JWT Authentication Filter
 * Intercepts every request, extracts and validates JWT token
 * Sets authentication in SecurityContext
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtUtil jwtUtil;
    
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            String jwt = extractJwtFromRequest(request);
            
            if (StringUtils.hasText(jwt)) {
                // Extract user details from token
                String email = jwtUtil.extractUsername(jwt);
                String role = jwtUtil.extractRole(jwt);
                UUID userId = jwtUtil.extractUserId(jwt);
                UUID schoolId = jwtUtil.extractSchoolId(jwt);
                
                // Validate token
                if (StringUtils.hasText(email) && jwtUtil.validateToken(jwt, email)) {
                    // Create UserDetails
                    UserDetails userDetails = User.builder()
                            .username(email)
                            .password("") // Password not needed for JWT auth
                            .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)))
                            .build();
                    
                    // Create authentication token
                    UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                    
                    // Set additional details (userId, schoolId, role)
                    JwtAuthenticationDetails details = new JwtAuthenticationDetails(
                            userId,
                            email,
                            role,
                            schoolId
                    );
                    authentication.setDetails(details);
                    
                    // Set authentication in SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                    log.debug("JWT authentication successful for user: {}", email);
                }
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
            // Don't throw exception, let the request proceed
            // Spring Security will handle unauthorized access
        }
        
        filterChain.doFilter(request, response);
    }
    
    /**
     * Extract JWT token from Authorization header
     */
    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        
        return null;
    }
}
