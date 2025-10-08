package com.schoolms.repository;

import com.schoolms.entity.Achievement;
import com.schoolms.enums.AchievementCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, UUID>, JpaSpecificationExecutor<Achievement> {
    
    List<Achievement> findBySchoolId(UUID schoolId);
    
    Page<Achievement> findBySchoolId(UUID schoolId, Pageable pageable);
    
    List<Achievement> findBySchoolIdAndCategory(UUID schoolId, AchievementCategory category);
    
    List<Achievement> findBySchoolIdAndIsPublished(UUID schoolId, Boolean isPublished);
    
    Page<Achievement> findBySchoolIdAndIsPublished(UUID schoolId, Boolean isPublished, Pageable pageable);
    
    List<Achievement> findBySchoolIdOrderByAchievementDateDesc(UUID schoolId);
}

