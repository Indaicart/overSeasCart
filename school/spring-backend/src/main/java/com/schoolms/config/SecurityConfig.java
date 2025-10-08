package com.schoolms.config;

import com.schoolms.security.JwtAccessDeniedHandler;
import com.schoolms.security.JwtAuthenticationEntryPoint;
import com.schoolms.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Spring Security Configuration
 * - Stateless JWT authentication
 * - CORS configuration
 * - Public/Protected endpoint definitions
 * - Role-based access control
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
    
    /**
     * Public endpoints that don't require authentication
     */
    private static final String[] PUBLIC_ENDPOINTS = {
            // Health check
            "/api/health/**",
            
            // Authentication
            "/api/auth/validate-school",
            "/api/auth/login",
            "/api/auth/register",
            
            // Password reset
            "/api/password-reset/request",
            "/api/password-reset/verify",
            "/api/password-reset/reset",
            
            // Self-service school registration
            "/api/self-service/**",
            
            // Payment webhooks (Razorpay)
            "/api/payments/webhook",
            
            // Swagger/API docs (if enabled)
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html"
    };
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF (using JWT tokens)
                .csrf(AbstractHttpConfigurer::disable)
                
                // Enable CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                
                // Stateless session management
                .sessionManagement(session -> 
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                
                // Exception handling
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(jwtAccessDeniedHandler))
                
                // Authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        
                        // Super Admin only endpoints
                        .requestMatchers("/api/platform-admin/**").hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/feature-management/**").hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/subscription-plans/**").hasRole("SUPER_ADMIN")
                        
                        // School Admin endpoints
                        .requestMatchers("/api/schools/*/settings").hasAnyRole("SCHOOL_ADMIN", "SUPER_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/students/**").hasAnyRole("SCHOOL_ADMIN", "SUPER_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/teachers/**").hasAnyRole("SCHOOL_ADMIN", "SUPER_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/classes/**").hasAnyRole("SCHOOL_ADMIN", "SUPER_ADMIN")
                        
                        // Teacher endpoints (both class and subject teachers)
                        .requestMatchers("/api/attendance/**").hasAnyRole("CLASS_TEACHER", "SUBJECT_TEACHER", "SCHOOL_ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/grades/**").hasAnyRole("CLASS_TEACHER", "SUBJECT_TEACHER", "SCHOOL_ADMIN", "SUPER_ADMIN")
                        
                        // Portal endpoints (role-specific)
                        .requestMatchers("/api/student-portal/**").hasRole("STUDENT")
                        .requestMatchers("/api/parent-portal/**").hasRole("PARENT")
                        .requestMatchers("/api/class-teacher-portal/**").hasRole("CLASS_TEACHER")
                        .requestMatchers("/api/subject-teacher-portal/**").hasRole("SUBJECT_TEACHER")
                        
                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                )
                
                // Add JWT filter before UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    /**
     * CORS Configuration
     * Allow requests from React frontend
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow frontend origins
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",   // React dev server
                "http://localhost:5000",   // Alternative port
                "http://127.0.0.1:3000",
                "http://127.0.0.1:5000"
        ));
        
        // Allow all HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));
        
        // Allow all headers
        configuration.setAllowedHeaders(List.of("*"));
        
        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);
        
        // Expose Authorization header
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Disposition"));
        
        // Cache preflight requests for 1 hour
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
    
    /**
     * Authentication Manager Bean
     * Required for manual authentication (if needed)
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
