package com.schoolms.repository;

import com.schoolms.entity.Feature;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FeatureRepository extends JpaRepository<Feature, UUID>, JpaSpecificationExecutor<Feature> {
    
    Optional<Feature> findByCode(String code);
    
    boolean existsByCode(String code);
    
    List<Feature> findByIsEnabled(Boolean isEnabled);
    
    Page<Feature> findByIsEnabled(Boolean isEnabled, Pageable pageable);
    
    List<Feature> findByCategory(String category);
    
    List<Feature> findByCategoryAndIsEnabled(String category, Boolean isEnabled);
    
    List<Feature> findAllByOrderByDisplayOrder();
    
    List<Feature> findByIsEnabledTrueOrderByDisplayOrder();
}

