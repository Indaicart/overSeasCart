package com.schoolms.service;

import com.schoolms.dto.fee.FeeCreateRequest;
import com.schoolms.dto.fee.FeeResponse;
import com.schoolms.dto.fee.FeeUpdateRequest;
import com.schoolms.entity.Fee;
import com.schoolms.entity.School;
import com.schoolms.entity.Student;
import com.schoolms.entity.User;
import com.schoolms.enums.FeeStatus;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.repository.FeeRepository;
import com.schoolms.repository.SchoolRepository;
import com.schoolms.repository.StudentRepository;
import com.schoolms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeeService {
    
    private final FeeRepository feeRepository;
    private final StudentRepository studentRepository;
    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public FeeResponse createFee(FeeCreateRequest request) {
        log.info("Creating fee for student: {}", request.getStudentId());
        
        studentRepository.findById(request.getStudentId())
            .orElseThrow(() -> new ResourceNotFoundException("Student", "id", request.getStudentId()));
        
        Fee fee = new Fee();
        fee.setStudentId(request.getStudentId());
        fee.setFeeType(request.getFeeType());
        fee.setAmount(request.getAmount());
        fee.setAmountPaid(0.0);
        fee.setStatus(FeeStatus.PENDING);
        fee.setDueDate(request.getDueDate());
        fee.setAcademicYear(request.getAcademicYear());
        fee.setTerm(request.getTerm());
        fee.setDescription(request.getDescription());
        fee.setSchoolId(request.getSchoolId());
        
        fee = feeRepository.save(fee);
        log.info("Fee created with ID: {}", fee.getId());
        return mapToResponse(fee);
    }
    
    public FeeResponse getFeeById(UUID id) {
        Fee fee = feeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Fee", "id", id));
        return mapToResponse(fee);
    }
    
    public List<FeeResponse> getFeesByStudent(UUID studentId) {
        List<Fee> fees = feeRepository.findByStudentId(studentId);
        return fees.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    public Page<FeeResponse> getFeesByStudent(UUID studentId, Pageable pageable) {
        Page<Fee> fees = feeRepository.findByStudentId(studentId, pageable);
        return fees.map(this::mapToResponse);
    }
    
    public List<FeeResponse> getPendingFees(UUID schoolId) {
        List<Fee> fees = feeRepository.findBySchoolIdAndStatus(schoolId, FeeStatus.PENDING);
        return fees.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    public List<FeeResponse> getOverdueFees(UUID schoolId) {
        List<Fee> fees = feeRepository.findOverdueFees(schoolId);
        return fees.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    @Transactional
    public FeeResponse updateFee(UUID id, FeeUpdateRequest request) {
        Fee fee = feeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Fee", "id", id));
        
        if (request.getAmount() != null) fee.setAmount(request.getAmount());
        if (request.getDueDate() != null) fee.setDueDate(request.getDueDate());
        if (request.getStatus() != null) fee.setStatus(request.getStatus());
        if (request.getDescription() != null) fee.setDescription(request.getDescription());
        
        fee = feeRepository.save(fee);
        return mapToResponse(fee);
    }
    
    @Transactional
    public void deleteFee(UUID id) {
        Fee fee = feeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Fee", "id", id));
        feeRepository.delete(fee);
    }
    
    @Transactional
    public FeeResponse recordPayment(UUID feeId, Double amountPaid) {
        Fee fee = feeRepository.findById(feeId)
            .orElseThrow(() -> new ResourceNotFoundException("Fee", "id", feeId));
        
        fee.setAmountPaid(fee.getAmountPaid() + amountPaid);
        
        if (fee.getAmountPaid() >= fee.getAmount()) {
            fee.setStatus(FeeStatus.PAID);
            fee.setPaidDate(java.time.LocalDate.now());
        } else if (fee.getAmountPaid() > 0) {
            fee.setStatus(FeeStatus.PARTIALLY_PAID);
        }
        
        fee = feeRepository.save(fee);
        return mapToResponse(fee);
    }
    
    private FeeResponse mapToResponse(Fee fee) {
        FeeResponse response = FeeResponse.builder()
            .id(fee.getId())
            .studentId(fee.getStudentId())
            .feeType(fee.getFeeType())
            .amount(fee.getAmount())
            .amountPaid(fee.getAmountPaid())
            .amountDue(fee.getAmount() - fee.getAmountPaid())
            .status(fee.getStatus())
            .dueDate(fee.getDueDate())
            .paidDate(fee.getPaidDate())
            .academicYear(fee.getAcademicYear())
            .term(fee.getTerm())
            .description(fee.getDescription())
            .schoolId(fee.getSchoolId())
            .createdAt(fee.getCreatedAt())
            .updatedAt(fee.getUpdatedAt())
            .build();
        
        Student student = studentRepository.findById(fee.getStudentId()).orElse(null);
        if (student != null) {
            response.setStudentIdNumber(student.getStudentId());
            User user = userRepository.findById(student.getUserId()).orElse(null);
            if (user != null) response.setStudentName(user.getFullName());
        }
        
        School school = schoolRepository.findById(fee.getSchoolId()).orElse(null);
        if (school != null) response.setSchoolName(school.getName());
        
        return response;
    }
}

