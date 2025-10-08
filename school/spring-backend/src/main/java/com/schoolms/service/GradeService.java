package com.schoolms.service;

import com.schoolms.dto.grade.*;
import com.schoolms.entity.*;
import com.schoolms.exception.BadRequestException;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GradeService {
    
    private final GradeRepository gradeRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    
    /**
     * Add grade for a single student
     */
    @Transactional
    public GradeResponse addGrade(GradeCreateRequest request) {
        log.info("Adding grade for student: {} in subject: {}", request.getStudentId(), request.getSubjectId());
        
        // Validate student exists
        studentRepository.findById(request.getStudentId())
            .orElseThrow(() -> new ResourceNotFoundException("Student", "id", request.getStudentId()));
        
        // Validate subject exists
        subjectRepository.findById(request.getSubjectId())
            .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));
        
        // Validate graded by user exists
        userRepository.findById(request.getGradedById())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getGradedById()));
        
        // Validate marks
        if (request.getMarksObtained() < 0 || request.getMarksObtained() > request.getTotalMarks()) {
            throw new BadRequestException("Marks obtained cannot be negative or greater than total marks");
        }
        
        // Create Grade
        Grade grade = new Grade();
        grade.setStudentId(request.getStudentId());
        grade.setSubjectId(request.getSubjectId());
        grade.setAssessmentType(request.getAssessmentType());
        grade.setAssessmentName(request.getAssessmentName());
        grade.setAssessmentDate(request.getAssessmentDate());
        grade.setMarksObtained(request.getMarksObtained());
        grade.setTotalMarks(request.getTotalMarks());
        grade.setGrade(request.getGrade() != null ? request.getGrade() : calculateGrade(request.getMarksObtained(), request.getTotalMarks()));
        grade.setRemarks(request.getRemarks());
        grade.setGradedById(request.getGradedById());
        grade.setSchoolId(request.getSchoolId());
        
        grade = gradeRepository.save(grade);
        
        log.info("Grade added successfully with ID: {}", grade.getId());
        return mapToResponse(grade);
    }
    
    /**
     * Add grades for multiple students (bulk operation)
     */
    @Transactional
    public List<GradeResponse> addBulkGrades(GradeBulkCreateRequest request) {
        log.info("Adding bulk grades for subject: {}", request.getSubjectId());
        
        // Validate subject exists
        subjectRepository.findById(request.getSubjectId())
            .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));
        
        // Validate graded by user exists
        userRepository.findById(request.getGradedById())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getGradedById()));
        
        List<GradeResponse> responses = new ArrayList<>();
        
        for (GradeBulkCreateRequest.StudentGrade studentGrade : request.getStudents()) {
            // Validate student exists
            studentRepository.findById(studentGrade.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentGrade.getStudentId()));
            
            // Validate marks
            if (studentGrade.getMarksObtained() < 0 || studentGrade.getMarksObtained() > request.getTotalMarks()) {
                log.warn("Invalid marks for student: {}, skipping", studentGrade.getStudentId());
                continue;
            }
            
            // Create Grade
            Grade grade = new Grade();
            grade.setStudentId(studentGrade.getStudentId());
            grade.setSubjectId(request.getSubjectId());
            grade.setAssessmentType(request.getAssessmentType());
            grade.setAssessmentName(request.getAssessmentName());
            grade.setAssessmentDate(request.getAssessmentDate());
            grade.setMarksObtained(studentGrade.getMarksObtained());
            grade.setTotalMarks(request.getTotalMarks());
            grade.setGrade(studentGrade.getGrade() != null ? studentGrade.getGrade() : 
                calculateGrade(studentGrade.getMarksObtained(), request.getTotalMarks()));
            grade.setRemarks(studentGrade.getRemarks());
            grade.setGradedById(request.getGradedById());
            grade.setSchoolId(request.getSchoolId());
            
            grade = gradeRepository.save(grade);
            responses.add(mapToResponse(grade));
        }
        
        log.info("Bulk grades added successfully for {} students", responses.size());
        return responses;
    }
    
    /**
     * Get grade by ID
     */
    public GradeResponse getGradeById(UUID id) {
        log.info("Fetching grade by ID: {}", id);
        Grade grade = gradeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Grade", "id", id));
        
        return mapToResponse(grade);
    }
    
    /**
     * Get grades by student
     */
    public List<GradeResponse> getGradesByStudent(UUID studentId) {
        log.info("Fetching grades for student: {}", studentId);
        List<Grade> grades = gradeRepository.findByStudentId(studentId);
        return grades.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get grades by student with pagination
     */
    public Page<GradeResponse> getGradesByStudent(UUID studentId, Pageable pageable) {
        log.info("Fetching grades for student: {} with pagination", studentId);
        Page<Grade> grades = gradeRepository.findByStudentId(studentId, pageable);
        return grades.map(this::mapToResponse);
    }
    
    /**
     * Get grades by subject
     */
    public List<GradeResponse> getGradesBySubject(UUID subjectId) {
        log.info("Fetching grades for subject: {}", subjectId);
        List<Grade> grades = gradeRepository.findBySubjectId(subjectId);
        return grades.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get grades by student and subject
     */
    public List<GradeResponse> getGradesByStudentAndSubject(UUID studentId, UUID subjectId) {
        log.info("Fetching grades for student: {} in subject: {}", studentId, subjectId);
        List<Grade> grades = gradeRepository.findByStudentIdAndSubjectId(studentId, subjectId);
        return grades.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get grade statistics for a student
     */
    public GradeStatsResponse getStudentGradeStats(UUID studentId) {
        log.info("Calculating grade stats for student: {}", studentId);
        
        List<Grade> grades = gradeRepository.findByStudentId(studentId);
        
        if (grades.isEmpty()) {
            return GradeStatsResponse.builder()
                .totalAssessments(0L)
                .averageMarks(0.0)
                .averagePercentage(0.0)
                .highestMarks(0.0)
                .lowestMarks(0.0)
                .build();
        }
        
        long totalAssessments = grades.size();
        double averageMarks = grades.stream()
            .mapToDouble(Grade::getMarksObtained)
            .average()
            .orElse(0.0);
        double averagePercentage = grades.stream()
            .mapToDouble(g -> (g.getMarksObtained() / g.getTotalMarks()) * 100)
            .average()
            .orElse(0.0);
        double highestMarks = grades.stream()
            .mapToDouble(g -> (g.getMarksObtained() / g.getTotalMarks()) * 100)
            .max()
            .orElse(0.0);
        double lowestMarks = grades.stream()
            .mapToDouble(g -> (g.getMarksObtained() / g.getTotalMarks()) * 100)
            .min()
            .orElse(0.0);
        
        return GradeStatsResponse.builder()
            .totalAssessments(totalAssessments)
            .averageMarks(Math.round(averageMarks * 100.0) / 100.0)
            .averagePercentage(Math.round(averagePercentage * 100.0) / 100.0)
            .highestMarks(Math.round(highestMarks * 100.0) / 100.0)
            .lowestMarks(Math.round(lowestMarks * 100.0) / 100.0)
            .build();
    }
    
    /**
     * Update grade
     */
    @Transactional
    public GradeResponse updateGrade(UUID id, GradeUpdateRequest request) {
        log.info("Updating grade: {}", id);
        
        Grade grade = gradeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Grade", "id", id));
        
        if (request.getMarksObtained() != null) {
            Double totalMarks = request.getTotalMarks() != null ? request.getTotalMarks() : grade.getTotalMarks();
            if (request.getMarksObtained() < 0 || request.getMarksObtained() > totalMarks) {
                throw new BadRequestException("Marks obtained cannot be negative or greater than total marks");
            }
            grade.setMarksObtained(request.getMarksObtained());
        }
        if (request.getTotalMarks() != null) grade.setTotalMarks(request.getTotalMarks());
        if (request.getGrade() != null) grade.setGrade(request.getGrade());
        if (request.getRemarks() != null) grade.setRemarks(request.getRemarks());
        
        // Recalculate grade if marks changed
        if (request.getMarksObtained() != null || request.getTotalMarks() != null) {
            if (request.getGrade() == null) {
                grade.setGrade(calculateGrade(grade.getMarksObtained(), grade.getTotalMarks()));
            }
        }
        
        grade = gradeRepository.save(grade);
        
        log.info("Grade updated successfully: {}", id);
        return mapToResponse(grade);
    }
    
    /**
     * Delete grade
     */
    @Transactional
    public void deleteGrade(UUID id) {
        log.info("Deleting grade: {}", id);
        
        Grade grade = gradeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Grade", "id", id));
        
        gradeRepository.delete(grade);
        
        log.info("Grade deleted successfully: {}", id);
    }
    
    /**
     * Calculate grade based on percentage
     */
    private String calculateGrade(Double marksObtained, Double totalMarks) {
        double percentage = (marksObtained / totalMarks) * 100;
        
        if (percentage >= 90) return "A+";
        else if (percentage >= 80) return "A";
        else if (percentage >= 70) return "B+";
        else if (percentage >= 60) return "B";
        else if (percentage >= 50) return "C";
        else if (percentage >= 40) return "D";
        else return "F";
    }
    
    /**
     * Map Grade entity to GradeResponse DTO
     */
    private GradeResponse mapToResponse(Grade grade) {
        double percentage = (grade.getMarksObtained() / grade.getTotalMarks()) * 100;
        
        GradeResponse response = GradeResponse.builder()
            .id(grade.getId())
            .studentId(grade.getStudentId())
            .subjectId(grade.getSubjectId())
            .assessmentType(grade.getAssessmentType())
            .assessmentName(grade.getAssessmentName())
            .assessmentDate(grade.getAssessmentDate())
            .marksObtained(grade.getMarksObtained())
            .totalMarks(grade.getTotalMarks())
            .percentage(Math.round(percentage * 100.0) / 100.0)
            .grade(grade.getGrade())
            .remarks(grade.getRemarks())
            .gradedById(grade.getGradedById())
            .schoolId(grade.getSchoolId())
            .createdAt(grade.getCreatedAt())
            .updatedAt(grade.getUpdatedAt())
            .build();
        
        // Get student name
        Student student = studentRepository.findById(grade.getStudentId()).orElse(null);
        if (student != null) {
            response.setStudentIdNumber(student.getStudentId());
            User studentUser = userRepository.findById(student.getUserId()).orElse(null);
            if (studentUser != null) {
                response.setStudentName(studentUser.getFullName());
            }
        }
        
        // Get subject name
        Subject subject = subjectRepository.findById(grade.getSubjectId()).orElse(null);
        if (subject != null) {
            response.setSubjectName(subject.getName());
            response.setSubjectCode(subject.getCode());
        }
        
        // Get graded by name
        User gradedByUser = userRepository.findById(grade.getGradedById()).orElse(null);
        if (gradedByUser != null) {
            response.setGradedByName(gradedByUser.getFullName());
        }
        
        // Get school name
        School school = schoolRepository.findById(grade.getSchoolId()).orElse(null);
        if (school != null) {
            response.setSchoolName(school.getName());
        }
        
        return response;
    }
}

