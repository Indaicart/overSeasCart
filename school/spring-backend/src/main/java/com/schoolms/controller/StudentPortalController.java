package com.schoolms.controller;

import com.schoolms.dto.attendance.AttendanceResponse;
import com.schoolms.dto.fee.FeeResponse;
import com.schoolms.dto.grade.GradeResponse;
import com.schoolms.dto.portal.StudentPortalDashboardResponse;
import com.schoolms.dto.timetable.TimetableResponse;
import com.schoolms.service.StudentPortalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/portal/student")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class StudentPortalController {
    
    private final StudentPortalService studentPortalService;
    
    @GetMapping("/dashboard/{userId}")
    public ResponseEntity<StudentPortalDashboardResponse> getDashboard(@PathVariable UUID userId) {
        log.info("Student portal dashboard request for user: {}", userId);
        StudentPortalDashboardResponse response = studentPortalService.getDashboard(userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/my-attendance/{userId}")
    public ResponseEntity<List<AttendanceResponse>> getMyAttendance(
            @PathVariable UUID userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<AttendanceResponse> response = studentPortalService.getMyAttendance(userId, startDate, endDate);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/my-grades/{userId}")
    public ResponseEntity<List<GradeResponse>> getMyGrades(@PathVariable UUID userId) {
        List<GradeResponse> response = studentPortalService.getMyGrades(userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/my-fees/{userId}")
    public ResponseEntity<List<FeeResponse>> getMyFees(@PathVariable UUID userId) {
        List<FeeResponse> response = studentPortalService.getMyFees(userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/my-timetable/{userId}")
    public ResponseEntity<List<TimetableResponse>> getMyTimetable(@PathVariable UUID userId) {
        List<TimetableResponse> response = studentPortalService.getMyTimetable(userId);
        return ResponseEntity.ok(response);
    }
}

