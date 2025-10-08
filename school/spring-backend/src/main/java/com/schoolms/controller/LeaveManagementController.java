package com.schoolms.controller;

import com.schoolms.dto.leave.LeaveApplicationCreateRequest;
import com.schoolms.dto.leave.LeaveApplicationResponse;
import com.schoolms.service.LeaveManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/leave")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class LeaveManagementController {
    
    private final LeaveManagementService leaveManagementService;
    
    @PostMapping("/apply")
    public ResponseEntity<LeaveApplicationResponse> applyLeave(@Valid @RequestBody LeaveApplicationCreateRequest request) {
        LeaveApplicationResponse response = leaveManagementService.applyLeave(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PutMapping("/{id}/approve")
    public ResponseEntity<LeaveApplicationResponse> approveLeave(
            @PathVariable UUID id,
            @RequestParam UUID approvedById,
            @RequestParam(required = false) String remarks) {
        LeaveApplicationResponse response = leaveManagementService.approveLeave(id, approvedById, remarks);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/reject")
    public ResponseEntity<LeaveApplicationResponse> rejectLeave(
            @PathVariable UUID id,
            @RequestParam UUID rejectedById,
            @RequestParam(required = false) String remarks) {
        LeaveApplicationResponse response = leaveManagementService.rejectLeave(id, rejectedById, remarks);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<LeaveApplicationResponse> getLeaveApplicationById(@PathVariable UUID id) {
        LeaveApplicationResponse response = leaveManagementService.getLeaveApplicationById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<LeaveApplicationResponse>> getLeaveApplicationsByTeacher(@PathVariable UUID teacherId) {
        List<LeaveApplicationResponse> response = leaveManagementService.getLeaveApplicationsByTeacher(teacherId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/teacher/{teacherId}/page")
    public ResponseEntity<Page<LeaveApplicationResponse>> getLeaveApplicationsByTeacherPaginated(
            @PathVariable UUID teacherId, Pageable pageable) {
        Page<LeaveApplicationResponse> response = leaveManagementService.getLeaveApplicationsByTeacher(teacherId, pageable);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/school/{schoolId}")
    public ResponseEntity<List<LeaveApplicationResponse>> getLeaveApplicationsBySchool(@PathVariable UUID schoolId) {
        List<LeaveApplicationResponse> response = leaveManagementService.getLeaveApplicationsBySchool(schoolId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/school/{schoolId}/pending")
    public ResponseEntity<List<LeaveApplicationResponse>> getPendingLeaveApplications(@PathVariable UUID schoolId) {
        List<LeaveApplicationResponse> response = leaveManagementService.getPendingLeaveApplications(schoolId);
        return ResponseEntity.ok(response);
    }
}

