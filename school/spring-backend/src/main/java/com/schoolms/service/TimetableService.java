package com.schoolms.service;

import com.schoolms.dto.timetable.TimetableCreateRequest;
import com.schoolms.dto.timetable.TimetableResponse;
import com.schoolms.entity.*;
import com.schoolms.enums.DayOfWeek;
import com.schoolms.exception.BadRequestException;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TimetableService {
    
    private final TimetableRepository timetableRepository;
    private final ClassRepository classRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public TimetableResponse createTimetableEntry(TimetableCreateRequest request) {
        log.info("Creating timetable entry for class: {}", request.getClassId());
        
        classRepository.findById(request.getClassId())
            .orElseThrow(() -> new ResourceNotFoundException("Class", "id", request.getClassId()));
        
        subjectRepository.findById(request.getSubjectId())
            .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));
        
        teacherRepository.findById(request.getTeacherId())
            .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", request.getTeacherId()));
        
        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }
        
        Timetable timetable = new Timetable();
        timetable.setClassId(request.getClassId());
        timetable.setSubjectId(request.getSubjectId());
        timetable.setTeacherId(request.getTeacherId());
        timetable.setDayOfWeek(request.getDayOfWeek());
        timetable.setStartTime(request.getStartTime());
        timetable.setEndTime(request.getEndTime());
        timetable.setRoomNumber(request.getRoomNumber());
        timetable.setSchoolId(request.getSchoolId());
        
        timetable = timetableRepository.save(timetable);
        log.info("Timetable entry created with ID: {}", timetable.getId());
        return mapToResponse(timetable);
    }
    
    public List<TimetableResponse> getTimetableByClass(UUID classId) {
        List<Timetable> entries = timetableRepository.findByClassId(classId);
        return entries.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    public List<TimetableResponse> getTimetableByClassAndDay(UUID classId, DayOfWeek dayOfWeek) {
        List<Timetable> entries = timetableRepository.findByClassIdAndDayOfWeek(classId, dayOfWeek);
        return entries.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    public List<TimetableResponse> getTimetableByTeacher(UUID teacherId) {
        List<Timetable> entries = timetableRepository.findByTeacherId(teacherId);
        return entries.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    @Transactional
    public void deleteTimetableEntry(UUID id) {
        Timetable timetable = timetableRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Timetable", "id", id));
        timetableRepository.delete(timetable);
    }
    
    private TimetableResponse mapToResponse(Timetable timetable) {
        TimetableResponse response = TimetableResponse.builder()
            .id(timetable.getId())
            .classId(timetable.getClassId())
            .subjectId(timetable.getSubjectId())
            .teacherId(timetable.getTeacherId())
            .dayOfWeek(timetable.getDayOfWeek())
            .startTime(timetable.getStartTime())
            .endTime(timetable.getEndTime())
            .roomNumber(timetable.getRoomNumber())
            .schoolId(timetable.getSchoolId())
            .createdAt(timetable.getCreatedAt())
            .updatedAt(timetable.getUpdatedAt())
            .build();
        
        Class classEntity = classRepository.findById(timetable.getClassId()).orElse(null);
        if (classEntity != null) response.setClassName(classEntity.getName());
        
        Subject subject = subjectRepository.findById(timetable.getSubjectId()).orElse(null);
        if (subject != null) response.setSubjectName(subject.getName());
        
        Teacher teacher = teacherRepository.findById(timetable.getTeacherId()).orElse(null);
        if (teacher != null) {
            User user = userRepository.findById(teacher.getUserId()).orElse(null);
            if (user != null) response.setTeacherName(user.getFullName());
        }
        
        return response;
    }
}

