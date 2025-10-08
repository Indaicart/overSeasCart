package com.schoolms.controller;

import com.schoolms.dto.attendance.*;
import com.schoolms.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AttendanceController {
    
    private final AttendanceService attendanceService;
    
    /**
     * Mark attendance for a single student
     * POST /api/attendance
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('CLASS_TEACHER', 'SUBJECT_TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<AttendanceResponse> markAttendance(@Valid @RequestBody AttendanceCreateRequest request) {
        log.info("Mark attendance request for student: {}", request.getStudentId());
        AttendanceResponse response = attendanceService.markAttendance(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Mark attendance for multiple students (bulk)
     * POST /api/attendance/bulk
     */
    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('CLASS_TEACHER', 'SUBJECT_TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<AttendanceResponse>> markBulkAttendance(
            @Valid @RequestBody AttendanceBulkCreateRequest request) {
        log.info("Mark bulk attendance request for class: {}", request.getClassId());
        List<AttendanceResponse> response = attendanceService.markBulkAttendance(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Get attendance by ID
     * GET /api/attendance/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<AttendanceResponse> getAttendanceById(@PathVariable UUID id) {
        log.info("Get attendance request for ID: {}", id);
        AttendanceResponse response = attendanceService.getAttendanceById(id);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get attendance by student
     * GET /api/attendance/student/{studentId}
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceByStudent(@PathVariable UUID studentId) {
        log.info("Get attendance request for student: {}", studentId);
        List<AttendanceResponse> response = attendanceService.getAttendanceByStudent(studentId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get attendance by student with pagination
     * GET /api/attendance/student/{studentId}/page
     */
    @GetMapping("/student/{studentId}/page")
    public ResponseEntity<Page<AttendanceResponse>> getAttendanceByStudentPaginated(
            @PathVariable UUID studentId,
            Pageable pageable) {
        log.info("Get attendance request for student: {} with pagination", studentId);
        Page<AttendanceResponse> response = attendanceService.getAttendanceByStudent(studentId, pageable);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get attendance by class and date
     * GET /api/attendance/class/{classId}/date/{date}
     */
    @GetMapping("/class/{classId}/date/{date}")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceByClassAndDate(
            @PathVariable UUID classId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        log.info("Get attendance request for class: {} on date: {}", classId, date);
        List<AttendanceResponse> response = attendanceService.getAttendanceByClassAndDate(classId, date);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get attendance by subject and date
     * GET /api/attendance/subject/{subjectId}/date/{date}
     */
    @GetMapping("/subject/{subjectId}/date/{date}")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceBySubjectAndDate(
            @PathVariable UUID subjectId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        log.info("Get attendance request for subject: {} on date: {}", subjectId, date);
        List<AttendanceResponse> response = attendanceService.getAttendanceBySubjectAndDate(subjectId, date);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get attendance by student and date range
     * GET /api/attendance/student/{studentId}/range?startDate={startDate}&endDate={endDate}
     */
    @GetMapping("/student/{studentId}/range")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceByStudentAndDateRange(
            @PathVariable UUID studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Get attendance request for student: {} from {} to {}", studentId, startDate, endDate);
        List<AttendanceResponse> response = attendanceService.getAttendanceByStudentAndDateRange(
            studentId, startDate, endDate);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get attendance by class and date range
     * GET /api/attendance/class/{classId}/range?startDate={startDate}&endDate={endDate}
     */
    @GetMapping("/class/{classId}/range")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceByClassAndDateRange(
            @PathVariable UUID classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Get attendance request for class: {} from {} to {}", classId, startDate, endDate);
        List<AttendanceResponse> response = attendanceService.getAttendanceByClassAndDateRange(
            classId, startDate, endDate);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get attendance statistics for a student
     * GET /api/attendance/student/{studentId}/stats?startDate={startDate}&endDate={endDate}
     */
    @GetMapping("/student/{studentId}/stats")
    public ResponseEntity<AttendanceStatsResponse> getStudentAttendanceStats(
            @PathVariable UUID studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Get attendance stats for student: {} from {} to {}", studentId, startDate, endDate);
        AttendanceStatsResponse response = attendanceService.getStudentAttendanceStats(studentId, startDate, endDate);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Update attendance
     * PUT /api/attendance/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<AttendanceResponse> updateAttendance(
            @PathVariable UUID id,
            @Valid @RequestBody AttendanceUpdateRequest request) {
        log.info("Update attendance request for ID: {}", id);
        AttendanceResponse response = attendanceService.updateAttendance(id, request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Delete attendance
     * DELETE /api/attendance/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttendance(@PathVariable UUID id) {
        log.info("Delete attendance request for ID: {}", id);
        attendanceService.deleteAttendance(id);
        return ResponseEntity.ok().build();
    }
}

