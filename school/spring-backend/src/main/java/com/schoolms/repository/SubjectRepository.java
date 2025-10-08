package com.schoolms.repository;

import com.schoolms.entity.Subject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, UUID>, JpaSpecificationExecutor<Subject> {
    
    Optional<Subject> findByCode(String code);
    
    boolean existsByCode(String code);
    
    List<Subject> findBySchoolId(UUID schoolId);
    
    Page<Subject> findBySchoolId(UUID schoolId, Pageable pageable);
    
    List<Subject> findBySchoolIdAndIsActive(UUID schoolId, Boolean isActive);
    
    Page<Subject> findBySchoolIdAndIsActive(UUID schoolId, Boolean isActive, Pageable pageable);
    
    List<Subject> findBySchoolIdAndDepartment(UUID schoolId, String department);
    
    List<Subject> findBySchoolIdAndIsCore(UUID schoolId, Boolean isCore);
    
    long countBySchoolId(UUID schoolId);
    
    Optional<Subject> findBySchoolIdAndCode(UUID schoolId, String code);
}
