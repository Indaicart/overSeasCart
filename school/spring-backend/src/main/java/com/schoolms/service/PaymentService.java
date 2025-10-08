package com.schoolms.service;

import com.schoolms.dto.payment.PaymentCreateRequest;
import com.schoolms.dto.payment.PaymentResponse;
import com.schoolms.entity.Fee;
import com.schoolms.entity.Payment;
import com.schoolms.entity.Student;
import com.schoolms.entity.User;
import com.schoolms.enums.PaymentStatus;
import com.schoolms.exception.BadRequestException;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.repository.FeeRepository;
import com.schoolms.repository.PaymentRepository;
import com.schoolms.repository.StudentRepository;
import com.schoolms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final FeeRepository feeRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final FeeService feeService;
    
    @Transactional
    public PaymentResponse createPayment(PaymentCreateRequest request) {
        log.info("Creating payment for fee: {}", request.getFeeId());
        
        Fee fee = feeRepository.findById(request.getFeeId())
            .orElseThrow(() -> new ResourceNotFoundException("Fee", "id", request.getFeeId()));
        
        if (request.getAmount() <= 0) {
            throw new BadRequestException("Payment amount must be greater than 0");
        }
        
        double remainingAmount = fee.getAmount() - fee.getAmountPaid();
        if (request.getAmount() > remainingAmount) {
            throw new BadRequestException("Payment amount exceeds remaining fee amount");
        }
        
        Payment payment = new Payment();
        payment.setFeeId(request.getFeeId());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaymentDate(request.getPaymentDate());
        payment.setTransactionId(request.getTransactionId());
        payment.setRemarks(request.getRemarks());
        payment.setPaymentType(request.getPaymentType());
        payment.setReceiptNumber(generateReceiptNumber());
        payment.setSchoolId(request.getSchoolId());
        
        payment = paymentRepository.save(payment);
        
        // Update fee
        feeService.recordPayment(request.getFeeId(), request.getAmount());
        
        log.info("Payment created with ID: {}", payment.getId());
        return mapToResponse(payment);
    }
    
    public PaymentResponse getPaymentById(UUID id) {
        Payment payment = paymentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
        return mapToResponse(payment);
    }
    
    public List<PaymentResponse> getPaymentsByFee(UUID feeId) {
        List<Payment> payments = paymentRepository.findByFeeId(feeId);
        return payments.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    public Page<PaymentResponse> getPaymentsBySchool(UUID schoolId, Pageable pageable) {
        Page<Payment> payments = paymentRepository.findBySchoolId(schoolId, pageable);
        return payments.map(this::mapToResponse);
    }
    
    @Transactional
    public void deletePayment(UUID id) {
        Payment payment = paymentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
        paymentRepository.delete(payment);
    }
    
    private String generateReceiptNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return "RCP-" + timestamp + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }
    
    private PaymentResponse mapToResponse(Payment payment) {
        PaymentResponse response = PaymentResponse.builder()
            .id(payment.getId())
            .feeId(payment.getFeeId())
            .amount(payment.getAmount())
            .paymentMethod(payment.getPaymentMethod())
            .status(payment.getStatus())
            .paymentDate(payment.getPaymentDate())
            .transactionId(payment.getTransactionId())
            .razorpayOrderId(payment.getRazorpayOrderId())
            .razorpayPaymentId(payment.getRazorpayPaymentId())
            .razorpaySignature(payment.getRazorpaySignature())
            .receiptNumber(payment.getReceiptNumber())
            .remarks(payment.getRemarks())
            .paymentType(payment.getPaymentType())
            .schoolId(payment.getSchoolId())
            .createdAt(payment.getCreatedAt())
            .updatedAt(payment.getUpdatedAt())
            .build();
        
        Fee fee = feeRepository.findById(payment.getFeeId()).orElse(null);
        if (fee != null) {
            response.setStudentId(fee.getStudentId());
            Student student = studentRepository.findById(fee.getStudentId()).orElse(null);
            if (student != null) {
                User user = userRepository.findById(student.getUserId()).orElse(null);
                if (user != null) response.setStudentName(user.getFullName());
            }
        }
        
        return response;
    }
}

