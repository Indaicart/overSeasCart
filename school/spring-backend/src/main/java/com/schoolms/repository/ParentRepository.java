package com.schoolms.repository;

import com.schoolms.entity.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ParentRepository extends JpaRepository<Parent, UUID>, JpaSpecificationExecutor<Parent> {
    
    Optional<Parent> findByUserId(UUID userId);
}

