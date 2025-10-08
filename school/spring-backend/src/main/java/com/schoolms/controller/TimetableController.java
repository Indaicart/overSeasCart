package com.schoolms.controller;

import com.schoolms.dto.timetable.TimetableCreateRequest;
import com.schoolms.dto.timetable.TimetableResponse;
import com.schoolms.enums.DayOfWeek;
import com.schoolms.service.TimetableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/timetable")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class TimetableController {
    
    private final TimetableService timetableService;
    
    @PostMapping
    public ResponseEntity<TimetableResponse> createTimetableEntry(@Valid @RequestBody TimetableCreateRequest request) {
        TimetableResponse response = timetableService.createTimetableEntry(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/class/{classId}")
    public ResponseEntity<List<TimetableResponse>> getTimetableByClass(@PathVariable UUID classId) {
        List<TimetableResponse> response = timetableService.getTimetableByClass(classId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/class/{classId}/day/{dayOfWeek}")
    public ResponseEntity<List<TimetableResponse>> getTimetableByClassAndDay(
            @PathVariable UUID classId, @PathVariable DayOfWeek dayOfWeek) {
        List<TimetableResponse> response = timetableService.getTimetableByClassAndDay(classId, dayOfWeek);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<TimetableResponse>> getTimetableByTeacher(@PathVariable UUID teacherId) {
        List<TimetableResponse> response = timetableService.getTimetableByTeacher(teacherId);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTimetableEntry(@PathVariable UUID id) {
        timetableService.deleteTimetableEntry(id);
        return ResponseEntity.ok().build();
    }
}

