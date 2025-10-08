package com.schoolms.controller;

import com.schoolms.dto.school.SchoolCreateRequest;
import com.schoolms.dto.school.SchoolResponse;
import com.schoolms.dto.school.SchoolUpdateRequest;
import com.schoolms.service.SchoolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/schools")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SchoolController {
    
    private final SchoolService schoolService;
    
    @PostMapping
    public ResponseEntity<SchoolResponse> createSchool(@Valid @RequestBody SchoolCreateRequest request) {
        log.info("Create school request: {}", request.getName());
        SchoolResponse response = schoolService.createSchool(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SchoolResponse> getSchoolById(@PathVariable UUID id) {
        SchoolResponse response = schoolService.getSchoolById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/code/{schoolCode}")
    public ResponseEntity<SchoolResponse> getSchoolByCode(@PathVariable String schoolCode) {
        SchoolResponse response = schoolService.getSchoolByCode(schoolCode);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    public ResponseEntity<List<SchoolResponse>> getAllSchools() {
        List<SchoolResponse> response = schoolService.getAllSchools();
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/page")
    public ResponseEntity<Page<SchoolResponse>> getAllSchoolsPaginated(Pageable pageable) {
        Page<SchoolResponse> response = schoolService.getAllSchools(pageable);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<SchoolResponse>> getActiveSchools() {
        List<SchoolResponse> response = schoolService.getActiveSchools();
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<SchoolResponse> updateSchool(
            @PathVariable UUID id, @Valid @RequestBody SchoolUpdateRequest request) {
        SchoolResponse response = schoolService.updateSchool(id, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchool(@PathVariable UUID id) {
        schoolService.deleteSchool(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/count")
    public ResponseEntity<Long> getSchoolCount() {
        long count = schoolService.getSchoolCount();
        return ResponseEntity.ok(count);
    }
}

