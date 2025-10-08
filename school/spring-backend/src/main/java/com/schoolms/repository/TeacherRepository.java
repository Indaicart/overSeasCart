package com.schoolms.repository;

import com.schoolms.entity.Teacher;
import com.schoolms.enums.TeacherStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, UUID>, JpaSpecificationExecutor<Teacher> {
    
    Optional<Teacher> findByTeacherId(String teacherId);
    
    Optional<Teacher> findByEmployeeNumber(String employeeNumber);
    
    boolean existsByTeacherId(String teacherId);
    
    boolean existsByEmployeeNumber(String employeeNumber);
    
    List<Teacher> findBySchoolId(UUID schoolId);
    
    Page<Teacher> findBySchoolId(UUID schoolId, Pageable pageable);
    
    List<Teacher> findBySchoolIdAndStatus(UUID schoolId, TeacherStatus status);
    
    Page<Teacher> findBySchoolIdAndStatus(UUID schoolId, TeacherStatus status, Pageable pageable);
    
    Optional<Teacher> findByClassTeacherFor(UUID classId);
    
    @Query("SELECT t FROM Teacher t WHERE t.schoolId = :schoolId AND :subjectId = ANY(t.subjectsTeaching)")
    List<Teacher> findTeachersBySubject(@Param("schoolId") UUID schoolId, @Param("subjectId") String subjectId);
    
    long countBySchoolId(UUID schoolId);
    
    long countBySchoolIdAndStatus(UUID schoolId, TeacherStatus status);
    
    Optional<Teacher> findByUserId(UUID userId);
}
