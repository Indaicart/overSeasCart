package com.schoolms.repository;

import com.schoolms.entity.StudentParent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentParentRepository extends JpaRepository<StudentParent, UUID>, JpaSpecificationExecutor<StudentParent> {
    
    List<StudentParent> findByStudentId(UUID studentId);
    
    List<StudentParent> findByParentId(UUID parentId);
    
    Optional<StudentParent> findByStudentIdAndParentId(UUID studentId, UUID parentId);
    
    List<StudentParent> findByParentIdAndIsPrimary(UUID parentId, Boolean isPrimary);
    
    boolean existsByStudentIdAndParentId(UUID studentId, UUID parentId);
}

