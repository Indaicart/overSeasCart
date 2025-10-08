package com.schoolms.repository;

import com.schoolms.entity.Class;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClassRepository extends JpaRepository<Class, UUID>, JpaSpecificationExecutor<Class> {
    
    List<Class> findBySchoolId(UUID schoolId);
    
    Page<Class> findBySchoolId(UUID schoolId, Pageable pageable);
    
    List<Class> findBySchoolIdAndAcademicYear(UUID schoolId, String academicYear);
    
    Page<Class> findBySchoolIdAndAcademicYear(UUID schoolId, String academicYear, Pageable pageable);
    
    List<Class> findBySchoolIdAndGrade(UUID schoolId, Integer grade);
    
    Optional<Class> findBySchoolIdAndNameAndAcademicYear(UUID schoolId, String name, String academicYear);
    
    List<Class> findByClassTeacherId(UUID teacherId);
    
    long countBySchoolId(UUID schoolId);
    
    long countBySchoolIdAndAcademicYear(UUID schoolId, String academicYear);
}
