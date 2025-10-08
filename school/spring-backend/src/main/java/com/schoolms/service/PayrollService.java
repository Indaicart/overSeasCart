package com.schoolms.service;

import com.schoolms.dto.payroll.StaffSalaryCreateRequest;
import com.schoolms.dto.payroll.StaffSalaryResponse;
import com.schoolms.entity.School;
import com.schoolms.entity.StaffSalary;
import com.schoolms.entity.Teacher;
import com.schoolms.entity.User;
import com.schoolms.exception.BadRequestException;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.repository.SchoolRepository;
import com.schoolms.repository.StaffSalaryRepository;
import com.schoolms.repository.TeacherRepository;
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
public class PayrollService {
    
    private final StaffSalaryRepository staffSalaryRepository;
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    
    @Transactional
    public StaffSalaryResponse createStaffSalary(StaffSalaryCreateRequest request) {
        log.info("Creating staff salary for teacher: {}", request.getTeacherId());
        
        Teacher teacher = teacherRepository.findById(request.getTeacherId())
            .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", request.getTeacherId()));
        
        // Check if salary already exists for this teacher
        if (staffSalaryRepository.existsByTeacherId(request.getTeacherId())) {
            throw new BadRequestException("Salary configuration already exists for this teacher");
        }
        
        double allowances = request.getAllowances() != null ? request.getAllowances() : 0.0;
        double deductions = request.getDeductions() != null ? request.getDeductions() : 0.0;
        double netSalary = request.getBasicSalary() + allowances - deductions;
        
        StaffSalary staffSalary = new StaffSalary();
        staffSalary.setTeacherId(request.getTeacherId());
        staffSalary.setBasicSalary(request.getBasicSalary());
        staffSalary.setAllowances(allowances);
        staffSalary.setDeductions(deductions);
        staffSalary.setNetSalary(netSalary);
        staffSalary.setPaymentFrequency(request.getPaymentFrequency());
        staffSalary.setEmploymentType(request.getEmploymentType());
        staffSalary.setBankAccountNumber(request.getBankAccountNumber());
        staffSalary.setBankName(request.getBankName());
        staffSalary.setIfscCode(request.getIfscCode());
        staffSalary.setSchoolId(request.getSchoolId());
        
        staffSalary = staffSalaryRepository.save(staffSalary);
        log.info("Staff salary created with ID: {}", staffSalary.getId());
        return mapToResponse(staffSalary);
    }
    
    public StaffSalaryResponse getStaffSalaryById(UUID id) {
        StaffSalary staffSalary = staffSalaryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("StaffSalary", "id", id));
        return mapToResponse(staffSalary);
    }
    
    public StaffSalaryResponse getStaffSalaryByTeacher(UUID teacherId) {
        StaffSalary staffSalary = staffSalaryRepository.findByTeacherId(teacherId)
            .orElseThrow(() -> new ResourceNotFoundException("StaffSalary", "teacherId", teacherId));
        return mapToResponse(staffSalary);
    }
    
    public List<StaffSalaryResponse> getStaffSalariesBySchool(UUID schoolId) {
        List<StaffSalary> salaries = staffSalaryRepository.findBySchoolId(schoolId);
        return salaries.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    public Page<StaffSalaryResponse> getStaffSalariesBySchool(UUID schoolId, Pageable pageable) {
        Page<StaffSalary> salaries = staffSalaryRepository.findBySchoolId(schoolId, pageable);
        return salaries.map(this::mapToResponse);
    }
    
    @Transactional
    public StaffSalaryResponse updateStaffSalary(UUID id, StaffSalaryCreateRequest request) {
        StaffSalary staffSalary = staffSalaryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("StaffSalary", "id", id));
        
        double allowances = request.getAllowances() != null ? request.getAllowances() : 0.0;
        double deductions = request.getDeductions() != null ? request.getDeductions() : 0.0;
        double netSalary = request.getBasicSalary() + allowances - deductions;
        
        staffSalary.setBasicSalary(request.getBasicSalary());
        staffSalary.setAllowances(allowances);
        staffSalary.setDeductions(deductions);
        staffSalary.setNetSalary(netSalary);
        staffSalary.setPaymentFrequency(request.getPaymentFrequency());
        staffSalary.setEmploymentType(request.getEmploymentType());
        staffSalary.setBankAccountNumber(request.getBankAccountNumber());
        staffSalary.setBankName(request.getBankName());
        staffSalary.setIfscCode(request.getIfscCode());
        
        staffSalary = staffSalaryRepository.save(staffSalary);
        return mapToResponse(staffSalary);
    }
    
    @Transactional
    public void deleteStaffSalary(UUID id) {
        StaffSalary staffSalary = staffSalaryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("StaffSalary", "id", id));
        staffSalaryRepository.delete(staffSalary);
    }
    
    private StaffSalaryResponse mapToResponse(StaffSalary staffSalary) {
        StaffSalaryResponse response = StaffSalaryResponse.builder()
            .id(staffSalary.getId())
            .teacherId(staffSalary.getTeacherId())
            .basicSalary(staffSalary.getBasicSalary())
            .allowances(staffSalary.getAllowances())
            .deductions(staffSalary.getDeductions())
            .netSalary(staffSalary.getNetSalary())
            .paymentFrequency(staffSalary.getPaymentFrequency())
            .employmentType(staffSalary.getEmploymentType())
            .bankAccountNumber(staffSalary.getBankAccountNumber())
            .bankName(staffSalary.getBankName())
            .ifscCode(staffSalary.getIfscCode())
            .schoolId(staffSalary.getSchoolId())
            .createdAt(staffSalary.getCreatedAt())
            .updatedAt(staffSalary.getUpdatedAt())
            .build();
        
        Teacher teacher = teacherRepository.findById(staffSalary.getTeacherId()).orElse(null);
        if (teacher != null) {
            response.setEmployeeId(teacher.getEmployeeId());
            User user = userRepository.findById(teacher.getUserId()).orElse(null);
            if (user != null) response.setTeacherName(user.getFullName());
        }
        
        School school = schoolRepository.findById(staffSalary.getSchoolId()).orElse(null);
        if (school != null) response.setSchoolName(school.getName());
        
        return response;
    }
}

