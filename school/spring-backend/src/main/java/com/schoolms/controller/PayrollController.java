package com.schoolms.controller;

import com.schoolms.dto.payroll.StaffSalaryCreateRequest;
import com.schoolms.dto.payroll.StaffSalaryResponse;
import com.schoolms.service.PayrollService;
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
@RequestMapping("/payroll")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PayrollController {
    
    private final PayrollService payrollService;
    
    @PostMapping("/staff-salary")
    public ResponseEntity<StaffSalaryResponse> createStaffSalary(@Valid @RequestBody StaffSalaryCreateRequest request) {
        StaffSalaryResponse response = payrollService.createStaffSalary(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/staff-salary/{id}")
    public ResponseEntity<StaffSalaryResponse> getStaffSalaryById(@PathVariable UUID id) {
        StaffSalaryResponse response = payrollService.getStaffSalaryById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/staff-salary/teacher/{teacherId}")
    public ResponseEntity<StaffSalaryResponse> getStaffSalaryByTeacher(@PathVariable UUID teacherId) {
        StaffSalaryResponse response = payrollService.getStaffSalaryByTeacher(teacherId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/staff-salary/school/{schoolId}")
    public ResponseEntity<List<StaffSalaryResponse>> getStaffSalariesBySchool(@PathVariable UUID schoolId) {
        List<StaffSalaryResponse> response = payrollService.getStaffSalariesBySchool(schoolId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/staff-salary/school/{schoolId}/page")
    public ResponseEntity<Page<StaffSalaryResponse>> getStaffSalariesBySchoolPaginated(
            @PathVariable UUID schoolId, Pageable pageable) {
        Page<StaffSalaryResponse> response = payrollService.getStaffSalariesBySchool(schoolId, pageable);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/staff-salary/{id}")
    public ResponseEntity<StaffSalaryResponse> updateStaffSalary(
            @PathVariable UUID id, @Valid @RequestBody StaffSalaryCreateRequest request) {
        StaffSalaryResponse response = payrollService.updateStaffSalary(id, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/staff-salary/{id}")
    public ResponseEntity<Void> deleteStaffSalary(@PathVariable UUID id) {
        payrollService.deleteStaffSalary(id);
        return ResponseEntity.ok().build();
    }
}

