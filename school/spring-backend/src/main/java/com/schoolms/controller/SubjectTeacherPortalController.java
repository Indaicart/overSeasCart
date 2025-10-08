package com.schoolms.controller;

import com.schoolms.dto.attendance.AttendanceResponse;
import com.schoolms.dto.grade.GradeResponse;
import com.schoolms.dto.student.StudentResponse;
import com.schoolms.dto.subject.SubjectResponse;
import com.schoolms.service.SubjectTeacherPortalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/portal/subject-teacher")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SubjectTeacherPortalController {
    
    private final SubjectTeacherPortalService subjectTeacherPortalService;
    
    @GetMapping("/my-subjects/{userId}")
    public ResponseEntity<List<SubjectResponse>> getMySubjects(@PathVariable UUID userId) {
        log.info("Get subjects for teacher: {}", userId);
        List<SubjectResponse> response = subjectTeacherPortalService.getMySubjects(userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/subject/{subjectId}/students")
    public ResponseEntity<List<StudentResponse>> getSubjectStudents(
            @PathVariable UUID subjectId,
            @RequestParam UUID userId) {
        List<StudentResponse> response = subjectTeacherPortalService.getSubjectStudents(userId, subjectId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/subject/{subjectId}/attendance")
    public ResponseEntity<List<AttendanceResponse>> getSubjectAttendance(
            @PathVariable UUID subjectId,
            @RequestParam UUID userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AttendanceResponse> response = subjectTeacherPortalService.getSubjectAttendance(userId, subjectId, date);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/subject/{subjectId}/grades")
    public ResponseEntity<List<GradeResponse>> getSubjectGrades(
            @PathVariable UUID subjectId,
            @RequestParam UUID userId) {
        List<GradeResponse> response = subjectTeacherPortalService.getSubjectGrades(userId, subjectId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/subject/{subjectId}/student/{studentId}/grades")
    public ResponseEntity<List<GradeResponse>> getStudentSubjectGrades(
            @PathVariable UUID subjectId,
            @PathVariable UUID studentId,
            @RequestParam UUID userId) {
        List<GradeResponse> response = subjectTeacherPortalService.getStudentSubjectGrades(userId, studentId, subjectId);
        return ResponseEntity.ok(response);
    }
}

