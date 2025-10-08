package com.schoolms.controller;

import com.schoolms.dto.attendance.AttendanceResponse;
import com.schoolms.dto.fee.FeeResponse;
import com.schoolms.dto.grade.GradeResponse;
import com.schoolms.dto.portal.ParentPortalDashboardResponse;
import com.schoolms.service.ParentPortalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/portal/parent")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ParentPortalController {
    
    private final ParentPortalService parentPortalService;
    
    @GetMapping("/dashboard/{userId}")
    public ResponseEntity<ParentPortalDashboardResponse> getDashboard(@PathVariable UUID userId) {
        log.info("Parent portal dashboard request for user: {}", userId);
        ParentPortalDashboardResponse response = parentPortalService.getDashboard(userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/child/{studentId}/attendance")
    public ResponseEntity<List<AttendanceResponse>> getChildAttendance(
            @PathVariable UUID studentId,
            @RequestParam UUID userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<AttendanceResponse> response = parentPortalService.getChildAttendance(userId, studentId, startDate, endDate);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/child/{studentId}/grades")
    public ResponseEntity<List<GradeResponse>> getChildGrades(
            @PathVariable UUID studentId,
            @RequestParam UUID userId) {
        List<GradeResponse> response = parentPortalService.getChildGrades(userId, studentId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/child/{studentId}/fees")
    public ResponseEntity<List<FeeResponse>> getChildFees(
            @PathVariable UUID studentId,
            @RequestParam UUID userId) {
        List<FeeResponse> response = parentPortalService.getChildFees(userId, studentId);
        return ResponseEntity.ok(response);
    }
}

