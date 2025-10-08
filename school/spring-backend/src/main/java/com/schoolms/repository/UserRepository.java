package com.schoolms.repository;

import com.schoolms.entity.User;
import com.schoolms.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<User> findBySchoolId(UUID schoolId);
    
    Page<User> findBySchoolId(UUID schoolId, Pageable pageable);
    
    List<User> findBySchoolIdAndRole(UUID schoolId, UserRole role);
    
    Page<User> findBySchoolIdAndRole(UUID schoolId, UserRole role, Pageable pageable);
    
    List<User> findBySchoolIdAndIsActive(UUID schoolId, Boolean isActive);
    
    Page<User> findBySchoolIdAndIsActive(UUID schoolId, Boolean isActive, Pageable pageable);
    
    long countBySchoolId(UUID schoolId);
    
    long countBySchoolIdAndRole(UUID schoolId, UserRole role);
    
    Optional<User> findByEmailAndSchoolId(String email, UUID schoolId);
}
