package com.schoolms.repository;

import com.schoolms.entity.Testimonial;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TestimonialRepository extends JpaRepository<Testimonial, UUID>, JpaSpecificationExecutor<Testimonial> {
    
    List<Testimonial> findBySchoolId(UUID schoolId);
    
    Page<Testimonial> findBySchoolId(UUID schoolId, Pageable pageable);
    
    List<Testimonial> findBySchoolIdAndIsPublished(UUID schoolId, Boolean isPublished);
    
    Page<Testimonial> findBySchoolIdAndIsPublished(UUID schoolId, Boolean isPublished, Pageable pageable);
    
    List<Testimonial> findBySchoolIdAndRatingGreaterThanEqual(UUID schoolId, Integer rating);
}

