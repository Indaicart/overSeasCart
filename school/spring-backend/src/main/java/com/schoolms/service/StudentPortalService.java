package com.schoolms.service;

import com.schoolms.dto.attendance.AttendanceResponse;
import com.schoolms.dto.fee.FeeResponse;
import com.schoolms.dto.grade.GradeResponse;
import com.schoolms.dto.notification.NotificationResponse;
import com.schoolms.dto.portal.StudentPortalDashboardResponse;
import com.schoolms.dto.timetable.TimetableResponse;
import com.schoolms.entity.*;
import com.schoolms.enums.DayOfWeek;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentPortalService {
    
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final ClassRepository classRepository;
    private final AttendanceService attendanceService;
    private final GradeService gradeService;
    private final FeeService feeService;
    private final NotificationService notificationService;
    private final TimetableService timetableService;
    private final FeeRepository feeRepository;
    private final AttendanceRepository attendanceRepository;
    private final GradeRepository gradeRepository;
    private final SubjectRepository subjectRepository;
    
    public StudentPortalDashboardResponse getDashboard(UUID userId) {
        log.info("Fetching student portal dashboard for user: {}", userId);
        
        // Get student by user ID
        Student student = studentRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Student", "userId", userId));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Get class info
        Class studentClass = student.getClassId() != null 
            ? classRepository.findById(student.getClassId()).orElse(null) 
            : null;
        
        // Build student info
        StudentPortalDashboardResponse.StudentInfo studentInfo = StudentPortalDashboardResponse.StudentInfo.builder()
            .studentId(student.getStudentId())
            .fullName(user.getFullName())
            .className(studentClass != null ? studentClass.getName() : null)
            .section(student.getSection())
            .rollNumber(student.getRollNumber())
            .profileImage(user.getProfileImage())
            .build();
        
        // Get attendance summary (last 30 days)
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(30);
        List<Attendance> attendanceList = attendanceRepository.findByStudentIdAndDateBetween(
            student.getId(), startDate, endDate);
        
        long totalDays = attendanceList.size();
        long presentDays = attendanceList.stream()
            .filter(a -> a.getStatus() == com.schoolms.enums.AttendanceStatus.PRESENT)
            .count();
        long absentDays = attendanceList.stream()
            .filter(a -> a.getStatus() == com.schoolms.enums.AttendanceStatus.ABSENT)
            .count();
        double attendancePercentage = totalDays > 0 ? (double) presentDays / totalDays * 100 : 0.0;
        
        StudentPortalDashboardResponse.AttendanceSummary attendanceSummary = 
            StudentPortalDashboardResponse.AttendanceSummary.builder()
                .totalDays(totalDays)
                .presentDays(presentDays)
                .absentDays(absentDays)
                .attendancePercentage(Math.round(attendancePercentage * 100.0) / 100.0)
                .build();
        
        // Get grade summary
        List<Grade> grades = gradeRepository.findByStudentId(student.getId());
        long totalAssessments = grades.size();
        double averagePercentage = grades.stream()
            .mapToDouble(g -> (g.getMarksObtained() / g.getTotalMarks()) * 100)
            .average()
            .orElse(0.0);
        
        // Calculate subject averages
        Map<String, Double> subjectAverages = grades.stream()
            .collect(Collectors.groupingBy(
                g -> {
                    Subject subject = subjectRepository.findById(g.getSubjectId()).orElse(null);
                    return subject != null ? subject.getName() : "Unknown";
                },
                Collectors.averagingDouble(g -> (g.getMarksObtained() / g.getTotalMarks()) * 100)
            ));
        
        StudentPortalDashboardResponse.GradeSummary gradeSummary = 
            StudentPortalDashboardResponse.GradeSummary.builder()
                .totalAssessments(totalAssessments)
                .averagePercentage(Math.round(averagePercentage * 100.0) / 100.0)
                .overallGrade(calculateGrade(averagePercentage))
                .subjectAverages(subjectAverages)
                .build();
        
        // Get fee summary
        List<Fee> fees = feeRepository.findByStudentId(student.getId());
        double totalFees = fees.stream().mapToDouble(Fee::getAmount).sum();
        double paidAmount = fees.stream().mapToDouble(Fee::getAmountPaid).sum();
        double dueAmount = totalFees - paidAmount;
        long pendingCount = fees.stream()
            .filter(f -> f.getStatus() == com.schoolms.enums.FeeStatus.PENDING || 
                        f.getStatus() == com.schoolms.enums.FeeStatus.PARTIALLY_PAID)
            .count();
        
        StudentPortalDashboardResponse.FeeSummary feeSummary = 
            StudentPortalDashboardResponse.FeeSummary.builder()
                .totalFees(totalFees)
                .paidAmount(paidAmount)
                .dueAmount(dueAmount)
                .pendingCount(pendingCount)
                .build();
        
        // Get today's schedule
        List<StudentPortalDashboardResponse.UpcomingClass> todaySchedule = new ArrayList<>();
        if (student.getClassId() != null) {
            DayOfWeek today = DayOfWeek.valueOf(LocalDate.now().getDayOfWeek().toString());
            List<TimetableResponse> timetable = timetableService.getTimetableByClassAndDay(student.getClassId(), today);
            todaySchedule = timetable.stream()
                .map(t -> StudentPortalDashboardResponse.UpcomingClass.builder()
                    .subjectName(t.getSubjectName())
                    .teacherName(t.getTeacherName())
                    .startTime(t.getStartTime().toString())
                    .endTime(t.getEndTime().toString())
                    .roomNumber(t.getRoomNumber())
                    .build())
                .collect(Collectors.toList());
        }
        
        // Get recent notifications (last 5)
        List<NotificationResponse> notifications = notificationService.getNotificationsByUser(userId);
        List<StudentPortalDashboardResponse.NotificationItem> recentNotifications = notifications.stream()
            .limit(5)
            .map(n -> StudentPortalDashboardResponse.NotificationItem.builder()
                .title(n.getTitle())
                .message(n.getMessage())
                .category(n.getCategory().toString())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .build())
            .collect(Collectors.toList());
        
        return StudentPortalDashboardResponse.builder()
            .studentInfo(studentInfo)
            .attendanceSummary(attendanceSummary)
            .gradeSummary(gradeSummary)
            .feeSummary(feeSummary)
            .todaySchedule(todaySchedule)
            .recentNotifications(recentNotifications)
            .build();
    }
    
    public List<AttendanceResponse> getMyAttendance(UUID userId, LocalDate startDate, LocalDate endDate) {
        Student student = studentRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Student", "userId", userId));
        return attendanceService.getAttendanceByStudentAndDateRange(student.getId(), startDate, endDate);
    }
    
    public List<GradeResponse> getMyGrades(UUID userId) {
        Student student = studentRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Student", "userId", userId));
        return gradeService.getGradesByStudent(student.getId());
    }
    
    public List<FeeResponse> getMyFees(UUID userId) {
        Student student = studentRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Student", "userId", userId));
        return feeService.getFeesByStudent(student.getId());
    }
    
    public List<TimetableResponse> getMyTimetable(UUID userId) {
        Student student = studentRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Student", "userId", userId));
        if (student.getClassId() == null) {
            return new ArrayList<>();
        }
        return timetableService.getTimetableByClass(student.getClassId());
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

