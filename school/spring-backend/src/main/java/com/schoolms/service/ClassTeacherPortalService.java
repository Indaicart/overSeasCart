package com.schoolms.service;

import com.schoolms.dto.attendance.AttendanceResponse;
import com.schoolms.dto.grade.GradeResponse;
import com.schoolms.dto.student.StudentResponse;
import com.schoolms.entity.Teacher;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.exception.UnauthorizedException;
import com.schoolms.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClassTeacherPortalService {
    
    private final TeacherRepository teacherRepository;
    private final StudentService studentService;
    private final AttendanceService attendanceService;
    private final GradeService gradeService;
    
    public List<StudentResponse> getMyClassStudents(UUID userId) {
        log.info("Fetching class students for teacher user: {}", userId);
        
        Teacher teacher = teacherRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Teacher", "userId", userId));
        
        if (!teacher.getIsClassTeacher() || teacher.getClassTeacherId() == null) {
            throw new UnauthorizedException("You are not assigned as a class teacher");
        }
        
        return studentService.getStudentsByClass(teacher.getClassTeacherId());
    }
    
    public List<AttendanceResponse> getClassAttendance(UUID userId, LocalDate date) {
        Teacher teacher = teacherRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Teacher", "userId", userId));
        
        if (!teacher.getIsClassTeacher() || teacher.getClassTeacherId() == null) {
            throw new UnauthorizedException("You are not assigned as a class teacher");
        }
        
        return attendanceService.getAttendanceByClassAndDate(teacher.getClassTeacherId(), date);
    }
    
    public List<AttendanceResponse> getStudentAttendance(UUID userId, UUID studentId, LocalDate startDate, LocalDate endDate) {
        verifyClassTeacherAccess(userId, studentId);
        return attendanceService.getAttendanceByStudentAndDateRange(studentId, startDate, endDate);
    }
    
    public List<GradeResponse> getStudentGrades(UUID userId, UUID studentId) {
        verifyClassTeacherAccess(userId, studentId);
        return gradeService.getGradesByStudent(studentId);
    }
    
    private void verifyClassTeacherAccess(UUID userId, UUID studentId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Teacher", "userId", userId));
        
        if (!teacher.getIsClassTeacher() || teacher.getClassTeacherId() == null) {
            throw new UnauthorizedException("You are not assigned as a class teacher");
        }
        
        StudentResponse student = studentService.getStudentById(studentId);
        if (!student.getClassId().equals(teacher.getClassTeacherId())) {
            throw new UnauthorizedException("This student is not in your class");
        }
    }
}

