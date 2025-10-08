package com.schoolms.service;

import com.schoolms.dto.admin.PlatformStatsResponse;
import com.schoolms.dto.school.SchoolResponse;
import com.schoolms.dto.subscription.SubscriptionResponse;
import com.schoolms.entity.Subscription;
import com.schoolms.enums.SubscriptionStatus;
import com.schoolms.enums.UserRole;
import com.schoolms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlatformAdminService {
    
    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final ParentRepository parentRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final SchoolService schoolService;
    private final SubscriptionService subscriptionService;
    
    public PlatformStatsResponse getPlatformStats() {
        log.info("Fetching platform statistics");
        
        long totalSchools = schoolRepository.count();
        long activeSchools = schoolRepository.countByIsActive(true);
        long totalStudents = studentRepository.count();
        long totalTeachers = teacherRepository.count();
        long totalParents = parentRepository.count();
        long activeSubscriptions = subscriptionRepository.countByStatus(SubscriptionStatus.ACTIVE);
        
        // Calculate total revenue from completed payments
        Double totalRevenue = paymentRepository.findAll().stream()
            .filter(p -> p.getStatus() == com.schoolms.enums.PaymentStatus.COMPLETED)
            .mapToDouble(p -> p.getAmount())
            .sum();
        
        // Subscriptions by plan
        List<Subscription> allSubscriptions = subscriptionRepository.findAll();
        Map<String, Long> subscriptionsByPlan = allSubscriptions.stream()
            .collect(Collectors.groupingBy(
                s -> s.getPlanId() != null ? s.getPlanId().toString() : "Unknown",
                Collectors.counting()
            ));
        
        // Subscriptions by status
        Map<String, Long> subscriptionsByStatus = allSubscriptions.stream()
            .collect(Collectors.groupingBy(
                s -> s.getStatus().toString(),
                Collectors.counting()
            ));
        
        return PlatformStatsResponse.builder()
            .totalSchools(totalSchools)
            .activeSchools(activeSchools)
            .totalStudents(totalStudents)
            .totalTeachers(totalTeachers)
            .totalParents(totalParents)
            .activeSubscriptions(activeSubscriptions)
            .totalRevenue(totalRevenue)
            .subscriptionsByPlan(subscriptionsByPlan)
            .subscriptionsByStatus(subscriptionsByStatus)
            .build();
    }
    
    public List<SchoolResponse> getAllSchools() {
        return schoolService.getAllSchools();
    }
    
    public Page<SchoolResponse> getAllSchools(Pageable pageable) {
        return schoolService.getAllSchools(pageable);
    }
    
    public List<SubscriptionResponse> getAllSubscriptions() {
        List<Subscription> subscriptions = subscriptionRepository.findAll();
        return subscriptions.stream()
            .map(s -> subscriptionService.getSubscriptionById(s.getId()))
            .collect(Collectors.toList());
    }
    
    public List<SubscriptionResponse> getSubscriptionsByStatus(SubscriptionStatus status) {
        List<Subscription> subscriptions = subscriptionRepository.findByStatus(status);
        return subscriptions.stream()
            .map(s -> subscriptionService.getSubscriptionById(s.getId()))
            .collect(Collectors.toList());
    }
}

