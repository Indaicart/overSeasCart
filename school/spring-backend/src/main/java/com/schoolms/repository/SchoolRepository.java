package com.schoolms.repository;

import com.schoolms.entity.School;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SchoolRepository extends JpaRepository<School, UUID>, JpaSpecificationExecutor<School> {
    
    Optional<School> findBySchoolCode(String schoolCode);
    
    boolean existsBySchoolCode(String schoolCode);
    
    List<School> findByNameContainingIgnoreCase(String name);
    
    Page<School> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    Optional<School> findByEmail(String email);
}
