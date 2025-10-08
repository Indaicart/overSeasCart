package com.schoolms.repository;

import com.schoolms.entity.Subscription;
import com.schoolms.enums.PlanType;
import com.schoolms.enums.SubscriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID>, JpaSpecificationExecutor<Subscription> {
    
    Optional<Subscription> findBySchoolId(UUID schoolId);
    
    List<Subscription> findByStatus(SubscriptionStatus status);
    
    Page<Subscription> findByStatus(SubscriptionStatus status, Pageable pageable);
    
    List<Subscription> findByPlanType(PlanType planType);
    
    Optional<Subscription> findBySchoolIdAndStatus(UUID schoolId, SubscriptionStatus status);
    
    Optional<Subscription> findByStripeSubscriptionId(String stripeSubscriptionId);
    
    List<Subscription> findByStatusAndEndDateBefore(SubscriptionStatus status, java.time.LocalDate date);
}

