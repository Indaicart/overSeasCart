package com.schoolms.repository;

import com.schoolms.entity.Grade;
import com.schoolms.enums.AssessmentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface GradeRepository extends JpaRepository<Grade, UUID>, JpaSpecificationExecutor<Grade> {
    
    List<Grade> findByStudentId(UUID studentId);
    
    Page<Grade> findByStudentId(UUID studentId, Pageable pageable);
    
    List<Grade> findByStudentIdAndSubjectId(UUID studentId, UUID subjectId);
    
    Page<Grade> findByStudentIdAndSubjectId(UUID studentId, UUID subjectId, Pageable pageable);
    
    List<Grade> findByClassId(UUID classId);
    
    Page<Grade> findByClassId(UUID classId, Pageable pageable);
    
    List<Grade> findByClassIdAndSubjectId(UUID classId, UUID subjectId);
    
    List<Grade> findByClassIdAndAssessmentType(UUID classId, AssessmentType assessmentType);
    
    List<Grade> findByStudentIdAndAssessmentDateBetween(UUID studentId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT AVG(g.percentage) FROM Grade g WHERE g.studentId = :studentId AND g.subjectId = :subjectId")
    Double getAveragePercentageByStudentAndSubject(@Param("studentId") UUID studentId, @Param("subjectId") UUID subjectId);
    
    @Query("SELECT AVG(g.percentage) FROM Grade g WHERE g.studentId = :studentId")
    Double getAveragePercentageByStudent(@Param("studentId") UUID studentId);
    
    @Query("SELECT g.subjectId, AVG(g.percentage) FROM Grade g WHERE g.classId = :classId GROUP BY g.subjectId")
    List<Object[]> getAveragePercentageByClassAndSubject(@Param("classId") UUID classId);
}
