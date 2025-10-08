package com.schoolms.service;

import com.schoolms.dto.school.SchoolCreateRequest;
import com.schoolms.dto.school.SchoolResponse;
import com.schoolms.dto.school.SchoolUpdateRequest;
import com.schoolms.entity.School;
import com.schoolms.exception.BadRequestException;
import com.schoolms.exception.ResourceNotFoundException;
import com.schoolms.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SchoolService {
    
    private final SchoolRepository schoolRepository;
    
    @Transactional
    public SchoolResponse createSchool(SchoolCreateRequest request) {
        log.info("Creating school: {}", request.getName());
        
        if (schoolRepository.existsBySchoolCode(request.getSchoolCode())) {
            throw new BadRequestException("School code already exists");
        }
        
        if (schoolRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        
        School school = new School();
        school.setName(request.getName());
        school.setSchoolCode(request.getSchoolCode());
        school.setEmail(request.getEmail());
        school.setPhone(request.getPhone());
        school.setAddress(request.getAddress());
        school.setCity(request.getCity());
        school.setState(request.getState());
        school.setZipCode(request.getZipCode());
        school.setCountry(request.getCountry());
        school.setWebsite(request.getWebsite());
        school.setPrincipalName(request.getPrincipalName());
        school.setPrincipalEmail(request.getPrincipalEmail());
        school.setPrincipalPhone(request.getPrincipalPhone());
        school.setAffiliationNumber(request.getAffiliationNumber());
        school.setBoardType(request.getBoardType());
        school.setLogo(request.getLogo());
        school.setIsActive(true);
        
        school = schoolRepository.save(school);
        log.info("School created with ID: {}", school.getId());
        return mapToResponse(school);
    }
    
    public SchoolResponse getSchoolById(UUID id) {
        log.info("Fetching school by ID: {}", id);
        School school = schoolRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("School", "id", id));
        return mapToResponse(school);
    }
    
    public SchoolResponse getSchoolByCode(String schoolCode) {
        log.info("Fetching school by code: {}", schoolCode);
        School school = schoolRepository.findBySchoolCode(schoolCode)
            .orElseThrow(() -> new ResourceNotFoundException("School", "schoolCode", schoolCode));
        return mapToResponse(school);
    }
    
    public List<SchoolResponse> getAllSchools() {
        log.info("Fetching all schools");
        List<School> schools = schoolRepository.findAll();
        return schools.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    public Page<SchoolResponse> getAllSchools(Pageable pageable) {
        log.info("Fetching all schools with pagination");
        Page<School> schools = schoolRepository.findAll(pageable);
        return schools.map(this::mapToResponse);
    }
    
    public List<SchoolResponse> getActiveSchools() {
        log.info("Fetching active schools");
        List<School> schools = schoolRepository.findByIsActive(true);
        return schools.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    @Transactional
    public SchoolResponse updateSchool(UUID id, SchoolUpdateRequest request) {
        log.info("Updating school: {}", id);
        
        School school = schoolRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("School", "id", id));
        
        if (request.getName() != null) school.setName(request.getName());
        
        if (request.getEmail() != null && !request.getEmail().equals(school.getEmail())) {
            if (schoolRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already in use");
            }
            school.setEmail(request.getEmail());
        }
        
        if (request.getPhone() != null) school.setPhone(request.getPhone());
        if (request.getAddress() != null) school.setAddress(request.getAddress());
        if (request.getCity() != null) school.setCity(request.getCity());
        if (request.setState() != null) school.setState(request.getState());
        if (request.getZipCode() != null) school.setZipCode(request.getZipCode());
        if (request.getCountry() != null) school.setCountry(request.getCountry());
        if (request.getWebsite() != null) school.setWebsite(request.getWebsite());
        if (request.getPrincipalName() != null) school.setPrincipalName(request.getPrincipalName());
        if (request.getPrincipalEmail() != null) school.setPrincipalEmail(request.getPrincipalEmail());
        if (request.getPrincipalPhone() != null) school.setPrincipalPhone(request.getPrincipalPhone());
        if (request.getAffiliationNumber() != null) school.setAffiliationNumber(request.getAffiliationNumber());
        if (request.getBoardType() != null) school.setBoardType(request.getBoardType());
        if (request.getLogo() != null) school.setLogo(request.getLogo());
        if (request.getIsActive() != null) school.setIsActive(request.getIsActive());
        
        school = schoolRepository.save(school);
        log.info("School updated successfully: {}", id);
        return mapToResponse(school);
    }
    
    @Transactional
    public void deleteSchool(UUID id) {
        log.info("Deleting school: {}", id);
        School school = schoolRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("School", "id", id));
        schoolRepository.delete(school);
        log.info("School deleted successfully: {}", id);
    }
    
    public long getSchoolCount() {
        return schoolRepository.count();
    }
    
    private SchoolResponse mapToResponse(School school) {
        return SchoolResponse.builder()
            .id(school.getId())
            .name(school.getName())
            .schoolCode(school.getSchoolCode())
            .email(school.getEmail())
            .phone(school.getPhone())
            .address(school.getAddress())
            .city(school.getCity())
            .state(school.getState())
            .zipCode(school.getZipCode())
            .country(school.getCountry())
            .website(school.getWebsite())
            .principalName(school.getPrincipalName())
            .principalEmail(school.getPrincipalEmail())
            .principalPhone(school.getPrincipalPhone())
            .affiliationNumber(school.getAffiliationNumber())
            .boardType(school.getBoardType())
            .logo(school.getLogo())
            .isActive(school.getIsActive())
            .createdAt(school.getCreatedAt())
            .updatedAt(school.getUpdatedAt())
            .build();
    }
}

