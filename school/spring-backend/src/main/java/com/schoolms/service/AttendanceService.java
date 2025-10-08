package com.schoolms.service;

import com.schoolms.dto.attendance.*;
import com.schoolms.entity.*;
import com.schoolms.enums.AttendanceStatus;
import com.schoolms.exception.BadRequestException;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceService {
    
    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    
    /**
     * Mark attendance for a single student
     */
    @Transactional
    public AttendanceResponse markAttendance(AttendanceCreateRequest request) {
        log.info("Marking attendance for student: {} on date: {}", request.getStudentId(), request.getDate());
        
        // Validate student exists
        Student student = studentRepository.findById(request.getStudentId())
            .orElseThrow(() -> new ResourceNotFoundException("Student", "id", request.getStudentId()));
        
        // Validate class exists
        classRepository.findById(request.getClassId())
            .orElseThrow(() -> new ResourceNotFoundException("Class", "id", request.getClassId()));
        
        // Validate subject exists (if provided)
        if (request.getSubjectId() != null) {
            subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));
        }
        
        // Validate marked by user exists
        userRepository.findById(request.getMarkedById())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getMarkedById()));
        
        // Check if attendance already exists for this student, class, subject, and date
        boolean exists = attendanceRepository.existsByStudentIdAndClassIdAndSubjectIdAndDate(
            request.getStudentId(), request.getClassId(), request.getSubjectId(), request.getDate());
        
        if (exists) {
            throw new BadRequestException("Attendance already marked for this student on this date");
        }
        
        // Create Attendance
        Attendance attendance = new Attendance();
        attendance.setStudentId(request.getStudentId());
        attendance.setClassId(request.getClassId());
        attendance.setSubjectId(request.getSubjectId());
        attendance.setDate(request.getDate());
        attendance.setStatus(request.getStatus());
        attendance.setMarkedById(request.getMarkedById());
        attendance.setRemarks(request.getRemarks());
        attendance.setSchoolId(request.getSchoolId());
        
        attendance = attendanceRepository.save(attendance);
        
        log.info("Attendance marked successfully with ID: {}", attendance.getId());
        return mapToResponse(attendance);
    }
    
    /**
     * Mark attendance for multiple students (bulk operation)
     */
    @Transactional
    public List<AttendanceResponse> markBulkAttendance(AttendanceBulkCreateRequest request) {
        log.info("Marking bulk attendance for class: {} on date: {}", request.getClassId(), request.getDate());
        
        // Validate class exists
        classRepository.findById(request.getClassId())
            .orElseThrow(() -> new ResourceNotFoundException("Class", "id", request.getClassId()));
        
        // Validate subject exists (if provided)
        if (request.getSubjectId() != null) {
            subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));
        }
        
        // Validate marked by user exists
        userRepository.findById(request.getMarkedById())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getMarkedById()));
        
        List<AttendanceResponse> responses = new ArrayList<>();
        
        for (AttendanceBulkCreateRequest.StudentAttendance studentAttendance : request.getStudents()) {
            // Validate student exists
            studentRepository.findById(studentAttendance.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentAttendance.getStudentId()));
            
            // Check if attendance already exists
            boolean exists = attendanceRepository.existsByStudentIdAndClassIdAndSubjectIdAndDate(
                studentAttendance.getStudentId(), request.getClassId(), request.getSubjectId(), request.getDate());
            
            if (exists) {
                log.warn("Attendance already exists for student: {} on date: {}, skipping", 
                    studentAttendance.getStudentId(), request.getDate());
                continue;
            }
            
            // Create Attendance
            Attendance attendance = new Attendance();
            attendance.setStudentId(studentAttendance.getStudentId());
            attendance.setClassId(request.getClassId());
            attendance.setSubjectId(request.getSubjectId());
            attendance.setDate(request.getDate());
            attendance.setStatus(studentAttendance.getStatus());
            attendance.setMarkedById(request.getMarkedById());
            attendance.setRemarks(studentAttendance.getRemarks());
            attendance.setSchoolId(request.getSchoolId());
            
            attendance = attendanceRepository.save(attendance);
            responses.add(mapToResponse(attendance));
        }
        
        log.info("Bulk attendance marked successfully for {} students", responses.size());
        return responses;
    }
    
    /**
     * Get attendance by ID
     */
    public AttendanceResponse getAttendanceById(UUID id) {
        log.info("Fetching attendance by ID: {}", id);
        Attendance attendance = attendanceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Attendance", "id", id));
        
        return mapToResponse(attendance);
    }
    
    /**
     * Get attendance by student
     */
    public List<AttendanceResponse> getAttendanceByStudent(UUID studentId) {
        log.info("Fetching attendance for student: {}", studentId);
        List<Attendance> attendanceList = attendanceRepository.findByStudentId(studentId);
        return attendanceList.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get attendance by student with pagination
     */
    public Page<AttendanceResponse> getAttendanceByStudent(UUID studentId, Pageable pageable) {
        log.info("Fetching attendance for student: {} with pagination", studentId);
        Page<Attendance> attendanceList = attendanceRepository.findByStudentId(studentId, pageable);
        return attendanceList.map(this::mapToResponse);
    }
    
    /**
     * Get attendance by class and date
     */
    public List<AttendanceResponse> getAttendanceByClassAndDate(UUID classId, LocalDate date) {
        log.info("Fetching attendance for class: {} on date: {}", classId, date);
        List<Attendance> attendanceList = attendanceRepository.findByClassIdAndDate(classId, date);
        return attendanceList.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get attendance by subject and date
     */
    public List<AttendanceResponse> getAttendanceBySubjectAndDate(UUID subjectId, LocalDate date) {
        log.info("Fetching attendance for subject: {} on date: {}", subjectId, date);
        List<Attendance> attendanceList = attendanceRepository.findBySubjectIdAndDate(subjectId, date);
        return attendanceList.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get attendance by student and date range
     */
    public List<AttendanceResponse> getAttendanceByStudentAndDateRange(
            UUID studentId, LocalDate startDate, LocalDate endDate) {
        log.info("Fetching attendance for student: {} from {} to {}", studentId, startDate, endDate);
        List<Attendance> attendanceList = attendanceRepository.findByStudentIdAndDateBetween(
            studentId, startDate, endDate);
        return attendanceList.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get attendance by class and date range
     */
    public List<AttendanceResponse> getAttendanceByClassAndDateRange(
            UUID classId, LocalDate startDate, LocalDate endDate) {
        log.info("Fetching attendance for class: {} from {} to {}", classId, startDate, endDate);
        List<Attendance> attendanceList = attendanceRepository.findByClassIdAndDateBetween(
            classId, startDate, endDate);
        return attendanceList.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get attendance statistics for a student
     */
    public AttendanceStatsResponse getStudentAttendanceStats(UUID studentId, LocalDate startDate, LocalDate endDate) {
        log.info("Calculating attendance stats for student: {} from {} to {}", studentId, startDate, endDate);
        
        List<Attendance> attendanceList = attendanceRepository.findByStudentIdAndDateBetween(
            studentId, startDate, endDate);
        
        long totalDays = attendanceList.size();
        long presentDays = attendanceList.stream()
            .filter(a -> a.getStatus() == AttendanceStatus.PRESENT)
            .count();
        long absentDays = attendanceList.stream()
            .filter(a -> a.getStatus() == AttendanceStatus.ABSENT)
            .count();
        long lateDays = attendanceList.stream()
            .filter(a -> a.getStatus() == AttendanceStatus.LATE)
            .count();
        long excusedDays = attendanceList.stream()
            .filter(a -> a.getStatus() == AttendanceStatus.EXCUSED)
            .count();
        
        double attendancePercentage = totalDays > 0 ? (double) presentDays / totalDays * 100 : 0.0;
        
        return AttendanceStatsResponse.builder()
            .totalDays(totalDays)
            .presentDays(presentDays)
            .absentDays(absentDays)
            .lateDays(lateDays)
            .excusedDays(excusedDays)
            .attendancePercentage(Math.round(attendancePercentage * 100.0) / 100.0)
            .build();
    }
    
    /**
     * Update attendance
     */
    @Transactional
    public AttendanceResponse updateAttendance(UUID id, AttendanceUpdateRequest request) {
        log.info("Updating attendance: {}", id);
        
        Attendance attendance = attendanceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Attendance", "id", id));
        
        if (request.getStatus() != null) attendance.setStatus(request.getStatus());
        if (request.getRemarks() != null) attendance.setRemarks(request.getRemarks());
        
        attendance = attendanceRepository.save(attendance);
        
        log.info("Attendance updated successfully: {}", id);
        return mapToResponse(attendance);
    }
    
    /**
     * Delete attendance
     */
    @Transactional
    public void deleteAttendance(UUID id) {
        log.info("Deleting attendance: {}", id);
        
        Attendance attendance = attendanceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Attendance", "id", id));
        
        attendanceRepository.delete(attendance);
        
        log.info("Attendance deleted successfully: {}", id);
    }
    
    /**
     * Map Attendance entity to AttendanceResponse DTO
     */
    private AttendanceResponse mapToResponse(Attendance attendance) {
        AttendanceResponse response = AttendanceResponse.builder()
            .id(attendance.getId())
            .studentId(attendance.getStudentId())
            .classId(attendance.getClassId())
            .subjectId(attendance.getSubjectId())
            .date(attendance.getDate())
            .status(attendance.getStatus())
            .markedById(attendance.getMarkedById())
            .remarks(attendance.getRemarks())
            .schoolId(attendance.getSchoolId())
            .createdAt(attendance.getCreatedAt())
            .updatedAt(attendance.getUpdatedAt())
            .build();
        
        // Get student name
        Student student = studentRepository.findById(attendance.getStudentId()).orElse(null);
        if (student != null) {
            response.setStudentIdNumber(student.getStudentId());
            User studentUser = userRepository.findById(student.getUserId()).orElse(null);
            if (studentUser != null) {
                response.setStudentName(studentUser.getFullName());
            }
        }
        
        // Get class name
        Class classEntity = classRepository.findById(attendance.getClassId()).orElse(null);
        if (classEntity != null) {
            response.setClassName(classEntity.getName());
            response.setSection(classEntity.getSection());
        }
        
        // Get subject name (if applicable)
        if (attendance.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(attendance.getSubjectId()).orElse(null);
            if (subject != null) {
                response.setSubjectName(subject.getName());
            }
        }
        
        // Get marked by name
        User markedByUser = userRepository.findById(attendance.getMarkedById()).orElse(null);
        if (markedByUser != null) {
            response.setMarkedByName(markedByUser.getFullName());
        }
        
        // Get school name
        School school = schoolRepository.findById(attendance.getSchoolId()).orElse(null);
        if (school != null) {
            response.setSchoolName(school.getName());
        }
        
        return response;
    }
}

