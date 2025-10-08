package com.schoolms.repository;

import com.schoolms.entity.PlatformAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlatformAdminRepository extends JpaRepository<PlatformAdmin, UUID>, JpaSpecificationExecutor<PlatformAdmin> {
    
    Optional<PlatformAdmin> findByUserId(UUID userId);
    
    List<PlatformAdmin> findByIsSuperAdmin(Boolean isSuperAdmin);
    
    boolean existsByUserId(UUID userId);
}

