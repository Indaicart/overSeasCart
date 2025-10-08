package com.schoolms.service;

import com.schoolms.dto.leave.LeaveApplicationCreateRequest;
import com.schoolms.dto.leave.LeaveApplicationResponse;
import com.schoolms.entity.LeaveApplication;
import com.schoolms.entity.LeaveBalance;
import com.schoolms.entity.LeaveType;
import com.schoolms.entity.Teacher;
import com.schoolms.entity.User;
import com.schoolms.enums.LeaveApplicationStatus;
import com.schoolms.exception.BadRequestException;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaveManagementService {
    
    private final LeaveApplicationRepository leaveApplicationRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public LeaveApplicationResponse applyLeave(LeaveApplicationCreateRequest request) {
        log.info("Creating leave application for teacher: {}", request.getTeacherId());
        
        teacherRepository.findById(request.getTeacherId())
            .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", request.getTeacherId()));
        
        LeaveType leaveType = leaveTypeRepository.findById(request.getLeaveTypeId())
            .orElseThrow(() -> new ResourceNotFoundException("LeaveType", "id", request.getLeaveTypeId()));
        
        // Calculate total days
        long totalDays = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        
        if (totalDays <= 0) {
            throw new BadRequestException("End date must be after or equal to start date");
        }
        
        // Check leave balance if not unpaid leave
        if (!leaveType.getIsPaid()) {
            // Unpaid leave - no balance check needed
        } else {
            LeaveBalance balance = leaveBalanceRepository
                .findByTeacherIdAndLeaveTypeId(request.getTeacherId(), request.getLeaveTypeId())
                .orElse(null);
            
            if (balance == null || balance.getRemainingDays() < totalDays) {
                throw new BadRequestException("Insufficient leave balance");
            }
        }
        
        LeaveApplication leaveApplication = new LeaveApplication();
        leaveApplication.setTeacherId(request.getTeacherId());
        leaveApplication.setLeaveTypeId(request.getLeaveTypeId());
        leaveApplication.setStartDate(request.getStartDate());
        leaveApplication.setEndDate(request.getEndDate());
        leaveApplication.setTotalDays((int) totalDays);
        leaveApplication.setReason(request.getReason());
        leaveApplication.setStatus(LeaveApplicationStatus.PENDING);
        leaveApplication.setSchoolId(request.getSchoolId());
        
        leaveApplication = leaveApplicationRepository.save(leaveApplication);
        log.info("Leave application created with ID: {}", leaveApplication.getId());
        return mapToResponse(leaveApplication);
    }
    
    @Transactional
    public LeaveApplicationResponse approveLeave(UUID id, UUID approvedById, String remarks) {
        log.info("Approving leave application: {}", id);
        
        LeaveApplication leaveApplication = leaveApplicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("LeaveApplication", "id", id));
        
        if (leaveApplication.getStatus() != LeaveApplicationStatus.PENDING) {
            throw new BadRequestException("Only pending leave applications can be approved");
        }
        
        leaveApplication.setStatus(LeaveApplicationStatus.APPROVED);
        leaveApplication.setApprovedById(approvedById);
        leaveApplication.setApprovedAt(LocalDateTime.now());
        leaveApplication.setApprovalRemarks(remarks);
        
        // Deduct from leave balance if paid leave
        LeaveType leaveType = leaveTypeRepository.findById(leaveApplication.getLeaveTypeId()).orElse(null);
        if (leaveType != null && leaveType.getIsPaid()) {
            LeaveBalance balance = leaveBalanceRepository
                .findByTeacherIdAndLeaveTypeId(leaveApplication.getTeacherId(), leaveApplication.getLeaveTypeId())
                .orElse(null);
            
            if (balance != null) {
                int usedDays = balance.getUsedDays() + leaveApplication.getTotalDays();
                int remainingDays = balance.getTotalDays() - usedDays;
                balance.setUsedDays(usedDays);
                balance.setRemainingDays(remainingDays);
                leaveBalanceRepository.save(balance);
            }
        }
        
        leaveApplication = leaveApplicationRepository.save(leaveApplication);
        return mapToResponse(leaveApplication);
    }
    
    @Transactional
    public LeaveApplicationResponse rejectLeave(UUID id, UUID rejectedById, String remarks) {
        LeaveApplication leaveApplication = leaveApplicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("LeaveApplication", "id", id));
        
        if (leaveApplication.getStatus() != LeaveApplicationStatus.PENDING) {
            throw new BadRequestException("Only pending leave applications can be rejected");
        }
        
        leaveApplication.setStatus(LeaveApplicationStatus.REJECTED);
        leaveApplication.setApprovedById(rejectedById);
        leaveApplication.setApprovedAt(LocalDateTime.now());
        leaveApplication.setApprovalRemarks(remarks);
        
        leaveApplication = leaveApplicationRepository.save(leaveApplication);
        return mapToResponse(leaveApplication);
    }
    
    public LeaveApplicationResponse getLeaveApplicationById(UUID id) {
        LeaveApplication leaveApplication = leaveApplicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("LeaveApplication", "id", id));
        return mapToResponse(leaveApplication);
    }
    
    public List<LeaveApplicationResponse> getLeaveApplicationsByTeacher(UUID teacherId) {
        List<LeaveApplication> applications = leaveApplicationRepository.findByTeacherId(teacherId);
        return applications.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    public Page<LeaveApplicationResponse> getLeaveApplicationsByTeacher(UUID teacherId, Pageable pageable) {
        Page<LeaveApplication> applications = leaveApplicationRepository.findByTeacherId(teacherId, pageable);
        return applications.map(this::mapToResponse);
    }
    
    public List<LeaveApplicationResponse> getLeaveApplicationsBySchool(UUID schoolId) {
        List<LeaveApplication> applications = leaveApplicationRepository.findBySchoolId(schoolId);
        return applications.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    public List<LeaveApplicationResponse> getPendingLeaveApplications(UUID schoolId) {
        List<LeaveApplication> applications = leaveApplicationRepository
            .findBySchoolIdAndStatus(schoolId, LeaveApplicationStatus.PENDING);
        return applications.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    private LeaveApplicationResponse mapToResponse(LeaveApplication leaveApplication) {
        LeaveApplicationResponse response = LeaveApplicationResponse.builder()
            .id(leaveApplication.getId())
            .teacherId(leaveApplication.getTeacherId())
            .leaveTypeId(leaveApplication.getLeaveTypeId())
            .startDate(leaveApplication.getStartDate())
            .endDate(leaveApplication.getEndDate())
            .totalDays(leaveApplication.getTotalDays())
            .reason(leaveApplication.getReason())
            .status(leaveApplication.getStatus())
            .approvedById(leaveApplication.getApprovedById())
            .approvedAt(leaveApplication.getApprovedAt())
            .approvalRemarks(leaveApplication.getApprovalRemarks())
            .schoolId(leaveApplication.getSchoolId())
            .createdAt(leaveApplication.getCreatedAt())
            .updatedAt(leaveApplication.getUpdatedAt())
            .build();
        
        Teacher teacher = teacherRepository.findById(leaveApplication.getTeacherId()).orElse(null);
        if (teacher != null) {
            User user = userRepository.findById(teacher.getUserId()).orElse(null);
            if (user != null) response.setTeacherName(user.getFullName());
        }
        
        LeaveType leaveType = leaveTypeRepository.findById(leaveApplication.getLeaveTypeId()).orElse(null);
        if (leaveType != null) response.setLeaveTypeName(leaveType.getName());
        
        if (leaveApplication.getApprovedById() != null) {
            User approver = userRepository.findById(leaveApplication.getApprovedById()).orElse(null);
            if (approver != null) response.setApprovedByName(approver.getFullName());
        }
        
        return response;
    }
}

