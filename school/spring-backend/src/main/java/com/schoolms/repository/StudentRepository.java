package com.schoolms.repository;

import com.schoolms.entity.Student;
import com.schoolms.enums.StudentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID>, JpaSpecificationExecutor<Student> {
    
    Optional<Student> findByStudentId(String studentId);
    
    Optional<Student> findByAdmissionNumber(String admissionNumber);
    
    boolean existsByStudentId(String studentId);
    
    boolean existsByAdmissionNumber(String admissionNumber);
    
    List<Student> findBySchoolId(UUID schoolId);
    
    Page<Student> findBySchoolId(UUID schoolId, Pageable pageable);
    
    List<Student> findByClassId(UUID classId);
    
    Page<Student> findByClassId(UUID classId, Pageable pageable);
    
    List<Student> findBySchoolIdAndStatus(UUID schoolId, StudentStatus status);
    
    Page<Student> findBySchoolIdAndStatus(UUID schoolId, StudentStatus status, Pageable pageable);
    
    List<Student> findBySchoolIdAndClassId(UUID schoolId, UUID classId);
    
    Page<Student> findBySchoolIdAndClassId(UUID schoolId, UUID classId, Pageable pageable);
    
    long countBySchoolId(UUID schoolId);
    
    long countBySchoolIdAndStatus(UUID schoolId, StudentStatus status);
    
    long countByClassId(UUID classId);
    
    Optional<Student> findByUserId(UUID userId);
}
