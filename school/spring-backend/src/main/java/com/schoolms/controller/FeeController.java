package com.schoolms.controller;

import com.schoolms.dto.fee.FeeCreateRequest;
import com.schoolms.dto.fee.FeeResponse;
import com.schoolms.dto.fee.FeeUpdateRequest;
import com.schoolms.service.FeeService;
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
@RequestMapping("/fees")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class FeeController {
    
    private final FeeService feeService;
    
    @PostMapping
    public ResponseEntity<FeeResponse> createFee(@Valid @RequestBody FeeCreateRequest request) {
        FeeResponse response = feeService.createFee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<FeeResponse> getFeeById(@PathVariable UUID id) {
        FeeResponse response = feeService.getFeeById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<FeeResponse>> getFeesByStudent(@PathVariable UUID studentId) {
        List<FeeResponse> response = feeService.getFeesByStudent(studentId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/student/{studentId}/page")
    public ResponseEntity<Page<FeeResponse>> getFeesByStudentPaginated(
            @PathVariable UUID studentId, Pageable pageable) {
        Page<FeeResponse> response = feeService.getFeesByStudent(studentId, pageable);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/school/{schoolId}/pending")
    public ResponseEntity<List<FeeResponse>> getPendingFees(@PathVariable UUID schoolId) {
        List<FeeResponse> response = feeService.getPendingFees(schoolId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/school/{schoolId}/overdue")
    public ResponseEntity<List<FeeResponse>> getOverdueFees(@PathVariable UUID schoolId) {
        List<FeeResponse> response = feeService.getOverdueFees(schoolId);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<FeeResponse> updateFee(
            @PathVariable UUID id, @Valid @RequestBody FeeUpdateRequest request) {
        FeeResponse response = feeService.updateFee(id, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFee(@PathVariable UUID id) {
        feeService.deleteFee(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{feeId}/payment")
    public ResponseEntity<FeeResponse> recordPayment(
            @PathVariable UUID feeId, @RequestParam Double amount) {
        FeeResponse response = feeService.recordPayment(feeId, amount);
        return ResponseEntity.ok(response);
    }
}

