package com.schoolms.controller;

import com.schoolms.dto.payment.PaymentCreateRequest;
import com.schoolms.dto.payment.PaymentResponse;
import com.schoolms.service.PaymentService;
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
@RequestMapping("/payments")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PaymentController {
    
    private final PaymentService paymentService;
    
    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(@Valid @RequestBody PaymentCreateRequest request) {
        PaymentResponse response = paymentService.createPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable UUID id) {
        PaymentResponse response = paymentService.getPaymentById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/fee/{feeId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByFee(@PathVariable UUID feeId) {
        List<PaymentResponse> response = paymentService.getPaymentsByFee(feeId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/school/{schoolId}")
    public ResponseEntity<Page<PaymentResponse>> getPaymentsBySchool(
            @PathVariable UUID schoolId, Pageable pageable) {
        Page<PaymentResponse> response = paymentService.getPaymentsBySchool(schoolId, pageable);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable UUID id) {
        paymentService.deletePayment(id);
        return ResponseEntity.ok().build();
    }
}

