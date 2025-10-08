package com.schoolms.repository;

import com.schoolms.entity.GalleryPhoto;
import com.schoolms.enums.EventType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GalleryPhotoRepository extends JpaRepository<GalleryPhoto, UUID>, JpaSpecificationExecutor<GalleryPhoto> {
    
    List<GalleryPhoto> findBySchoolId(UUID schoolId);
    
    Page<GalleryPhoto> findBySchoolId(UUID schoolId, Pageable pageable);
    
    List<GalleryPhoto> findBySchoolIdAndEventType(UUID schoolId, EventType eventType);
    
    List<GalleryPhoto> findBySchoolIdAndIsPublished(UUID schoolId, Boolean isPublished);
    
    Page<GalleryPhoto> findBySchoolIdAndIsPublished(UUID schoolId, Boolean isPublished, Pageable pageable);
    
    List<GalleryPhoto> findByUploadedBy(UUID uploadedBy);
    
    List<GalleryPhoto> findBySchoolIdOrderByEventDateDesc(UUID schoolId);
}

