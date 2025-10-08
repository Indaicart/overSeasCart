package com.schoolms.repository;

import com.schoolms.entity.Attendance;
import com.schoolms.enums.AttendanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, UUID>, JpaSpecificationExecutor<Attendance> {
    
    List<Attendance> findByStudentId(UUID studentId);
    
    List<Attendance> findByStudentIdAndDateBetween(UUID studentId, LocalDate startDate, LocalDate endDate);
    
    List<Attendance> findByClassIdAndDate(UUID classId, LocalDate date);
    
    Page<Attendance> findByClassIdAndDate(UUID classId, LocalDate date, Pageable pageable);
    
    List<Attendance> findByClassIdAndDateBetween(UUID classId, LocalDate startDate, LocalDate endDate);
    
    Optional<Attendance> findByStudentIdAndDateAndAttendanceType(UUID studentId, LocalDate date, String attendanceType);
    
    Optional<Attendance> findByStudentIdAndDateAndSubjectId(UUID studentId, LocalDate date, UUID subjectId);
    
    List<Attendance> findBySubjectIdAndDate(UUID subjectId, LocalDate date);
    
    List<Attendance> findBySubjectIdAndDateBetween(UUID subjectId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.studentId = :studentId AND a.date BETWEEN :startDate AND :endDate AND a.status = :status")
    long countByStudentAndDateRangeAndStatus(
        @Param("studentId") UUID studentId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("status") AttendanceStatus status
    );
    
    @Query("SELECT a.status, COUNT(a) FROM Attendance a WHERE a.studentId = :studentId AND a.date BETWEEN :startDate AND :endDate GROUP BY a.status")
    List<Object[]> getAttendanceStatsByStudent(
        @Param("studentId") UUID studentId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}
