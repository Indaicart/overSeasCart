package com.schoolms.service;

import com.schoolms.dto.attendance.AttendanceResponse;
import com.schoolms.dto.grade.GradeResponse;
import com.schoolms.dto.student.StudentResponse;
import com.schoolms.dto.subject.SubjectResponse;
import com.schoolms.entity.Subject;
import com.schoolms.entity.Teacher;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.exception.UnauthorizedException;
import com.schoolms.repository.SubjectRepository;
import com.schoolms.repository.TeacherRepository;
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
public class SubjectTeacherPortalService {
    
    private final TeacherRepository teacherRepository;
    private final SubjectRepository subjectRepository;
    private final SubjectService subjectService;
    private final StudentService studentService;
    private final AttendanceService attendanceService;
    private final GradeService gradeService;
    
    public List<SubjectResponse> getMySubjects(UUID userId) {
        log.info("Fetching subjects for teacher user: {}", userId);
        
        Teacher teacher = teacherRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Teacher", "userId", userId));
        
        return subjectService.getSubjectsByTeacher(teacher.getId());
    }
    
    public List<StudentResponse> getSubjectStudents(UUID userId, UUID subjectId) {
        log.info("Fetching students for subject: {} by teacher: {}", subjectId, userId);
        
        verifySubjectTeacherAccess(userId, subjectId);
        
        Subject subject = subjectRepository.findById(subjectId)
            .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", subjectId));
        
        if (subject.getClassId() == null) {
            return new ArrayList<>();
        }
        
        return studentService.getStudentsByClass(subject.getClassId());
    }
    
    public List<AttendanceResponse> getSubjectAttendance(UUID userId, UUID subjectId, LocalDate date) {
        verifySubjectTeacherAccess(userId, subjectId);
        return attendanceService.getAttendanceBySubjectAndDate(subjectId, date);
    }
    
    public List<GradeResponse> getSubjectGrades(UUID userId, UUID subjectId) {
        verifySubjectTeacherAccess(userId, subjectId);
        return gradeService.getGradesBySubject(subjectId);
    }
    
    public List<GradeResponse> getStudentSubjectGrades(UUID userId, UUID studentId, UUID subjectId) {
        verifySubjectTeacherAccess(userId, subjectId);
        return gradeService.getGradesByStudentAndSubject(studentId, subjectId);
    }
    
    private void verifySubjectTeacherAccess(UUID userId, UUID subjectId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Teacher", "userId", userId));
        
        if (teacher.getSubjectsCSV() == null || teacher.getSubjectsCSV().isEmpty()) {
            throw new UnauthorizedException("You are not assigned to teach any subjects");
        }
        
        List<UUID> subjectIds = List.of(teacher.getSubjectsCSV().split(","))
            .stream()
            .map(UUID::fromString)
            .collect(Collectors.toList());
        
        if (!subjectIds.contains(subjectId)) {
            throw new UnauthorizedException("You are not assigned to teach this subject");
        }
    }
}

