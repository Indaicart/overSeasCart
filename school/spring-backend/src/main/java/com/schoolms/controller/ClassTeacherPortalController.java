package com.schoolms.controller;

import com.schoolms.dto.attendance.AttendanceResponse;
import com.schoolms.dto.grade.GradeResponse;
import com.schoolms.dto.student.StudentResponse;
import com.schoolms.service.ClassTeacherPortalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/portal/class-teacher")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ClassTeacherPortalController {
    
    private final ClassTeacherPortalService classTeacherPortalService;
    
    @GetMapping("/my-students/{userId}")
    public ResponseEntity<List<StudentResponse>> getMyClassStudents(@PathVariable UUID userId) {
        log.info("Get class students for teacher: {}", userId);
        List<StudentResponse> response = classTeacherPortalService.getMyClassStudents(userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/attendance/{userId}")
    public ResponseEntity<List<AttendanceResponse>> getClassAttendance(
            @PathVariable UUID userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AttendanceResponse> response = classTeacherPortalService.getClassAttendance(userId, date);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/student/{studentId}/attendance")
    public ResponseEntity<List<AttendanceResponse>> getStudentAttendance(
            @PathVariable UUID studentId,
            @RequestParam UUID userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<AttendanceResponse> response = classTeacherPortalService.getStudentAttendance(userId, studentId, startDate, endDate);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/student/{studentId}/grades")
    public ResponseEntity<List<GradeResponse>> getStudentGrades(
            @PathVariable UUID studentId,
            @RequestParam UUID userId) {
        List<GradeResponse> response = classTeacherPortalService.getStudentGrades(userId, studentId);
        return ResponseEntity.ok(response);
    }
}

