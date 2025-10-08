package com.schoolms.service;

import com.schoolms.dto.attendance.AttendanceResponse;
import com.schoolms.dto.fee.FeeResponse;
import com.schoolms.dto.grade.GradeResponse;
import com.schoolms.dto.portal.ParentPortalDashboardResponse;
import com.schoolms.entity.*;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.exception.UnauthorizedException;
import com.schoolms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ParentPortalService {
    
    private final ParentRepository parentRepository;
    private final UserRepository userRepository;
    private final StudentParentRepository studentParentRepository;
    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;
    private final AttendanceRepository attendanceRepository;
    private final GradeRepository gradeRepository;
    private final FeeRepository feeRepository;
    private final AttendanceService attendanceService;
    private final GradeService gradeService;
    private final FeeService feeService;
    
    public ParentPortalDashboardResponse getDashboard(UUID userId) {
        log.info("Fetching parent portal dashboard for user: {}", userId);
        
        Parent parent = parentRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Parent", "userId", userId));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Get all children
        List<StudentParent> links = studentParentRepository.findByParentId(parent.getId());
        
        ParentPortalDashboardResponse.ParentInfo parentInfo = ParentPortalDashboardResponse.ParentInfo.builder()
            .fullName(user.getFullName())
            .email(user.getEmail())
            .phone(user.getPhone())
            .childrenCount(links.size())
            .build();
        
        List<ParentPortalDashboardResponse.ChildDashboard> children = links.stream()
            .map(link -> buildChildDashboard(link))
            .collect(Collectors.toList());
        
        return ParentPortalDashboardResponse.builder()
            .parentInfo(parentInfo)
            .children(children)
            .build();
    }
    
    private ParentPortalDashboardResponse.ChildDashboard buildChildDashboard(StudentParent link) {
        Student student = studentRepository.findById(link.getStudentId()).orElse(null);
        if (student == null) return null;
        
        User studentUser = userRepository.findById(student.getUserId()).orElse(null);
        Class studentClass = student.getClassId() != null 
            ? classRepository.findById(student.getClassId()).orElse(null) 
            : null;
        
        // Attendance summary (last 30 days)
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(30);
        List<Attendance> attendanceList = attendanceRepository.findByStudentIdAndDateBetween(
            student.getId(), startDate, endDate);
        
        long totalDays = attendanceList.size();
        long presentDays = attendanceList.stream()
            .filter(a -> a.getStatus() == com.schoolms.enums.AttendanceStatus.PRESENT)
            .count();
        double attendancePercentage = totalDays > 0 ? (double) presentDays / totalDays * 100 : 0.0;
        
        ParentPortalDashboardResponse.AttendanceSummary attendanceSummary = 
            ParentPortalDashboardResponse.AttendanceSummary.builder()
                .totalDays(totalDays)
                .presentDays(presentDays)
                .attendancePercentage(Math.round(attendancePercentage * 100.0) / 100.0)
                .build();
        
        // Grade summary
        List<Grade> grades = gradeRepository.findByStudentId(student.getId());
        long totalAssessments = grades.size();
        double averagePercentage = grades.stream()
            .mapToDouble(g -> (g.getMarksObtained() / g.getTotalMarks()) * 100)
            .average()
            .orElse(0.0);
        
        ParentPortalDashboardResponse.GradeSummary gradeSummary = 
            ParentPortalDashboardResponse.GradeSummary.builder()
                .totalAssessments(totalAssessments)
                .averagePercentage(Math.round(averagePercentage * 100.0) / 100.0)
                .overallGrade(calculateGrade(averagePercentage))
                .build();
        
        // Fee summary
        List<Fee> fees = feeRepository.findByStudentId(student.getId());
        double totalFees = fees.stream().mapToDouble(Fee::getAmount).sum();
        double paidAmount = fees.stream().mapToDouble(Fee::getAmountPaid).sum();
        double dueAmount = totalFees - paidAmount;
        
        ParentPortalDashboardResponse.FeeSummary feeSummary = 
            ParentPortalDashboardResponse.FeeSummary.builder()
                .totalFees(totalFees)
                .paidAmount(paidAmount)
                .dueAmount(dueAmount)
                .build();
        
        return ParentPortalDashboardResponse.ChildDashboard.builder()
            .studentId(student.getId())
            .studentName(studentUser != null ? studentUser.getFullName() : null)
            .studentIdNumber(student.getStudentId())
            .className(studentClass != null ? studentClass.getName() : null)
            .section(student.getSection())
            .relationship(link.getRelationshipType().toString())
            .isPrimaryGuardian(link.getIsPrimaryGuardian())
            .attendanceSummary(attendanceSummary)
            .gradeSummary(gradeSummary)
            .feeSummary(feeSummary)
            .build();
    }
    
    public List<AttendanceResponse> getChildAttendance(UUID userId, UUID studentId, LocalDate startDate, LocalDate endDate) {
        verifyParentStudentRelationship(userId, studentId);
        return attendanceService.getAttendanceByStudentAndDateRange(studentId, startDate, endDate);
    }
    
    public List<GradeResponse> getChildGrades(UUID userId, UUID studentId) {
        verifyParentStudentRelationship(userId, studentId);
        return gradeService.getGradesByStudent(studentId);
    }
    
    public List<FeeResponse> getChildFees(UUID userId, UUID studentId) {
        verifyParentStudentRelationship(userId, studentId);
        return feeService.getFeesByStudent(studentId);
    }
    
    private void verifyParentStudentRelationship(UUID userId, UUID studentId) {
        Parent parent = parentRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Parent", "userId", userId));
        
        boolean hasRelationship = studentParentRepository.existsByStudentIdAndParentId(studentId, parent.getId());
        if (!hasRelationship) {
            throw new UnauthorizedException("You do not have access to this student's information");
        }
    }
    
    private String calculateGrade(double percentage) {
        if (percentage >= 90) return "A+";
        else if (percentage >= 80) return "A";
        else if (percentage >= 70) return "B+";
        else if (percentage >= 60) return "B";
        else if (percentage >= 50) return "C";
        else if (percentage >= 40) return "D";
        else return "F";
    }
}

