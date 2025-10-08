package com.schoolms.repository;

import com.schoolms.entity.SubscriptionPlan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, UUID>, JpaSpecificationExecutor<SubscriptionPlan> {
    
    Optional<SubscriptionPlan> findByCode(String code);
    
    boolean existsByCode(String code);
    
    List<SubscriptionPlan> findByIsActive(Boolean isActive);
    
    Page<SubscriptionPlan> findByIsActive(Boolean isActive, Pageable pageable);
    
    List<SubscriptionPlan> findAllByOrderByDisplayOrder();
    
    List<SubscriptionPlan> findByIsActiveTrueOrderByDisplayOrder();
}

