package com.schoolms.repository;

import com.schoolms.entity.Timetable;
import com.schoolms.enums.DayOfWeek;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, UUID>, JpaSpecificationExecutor<Timetable> {
    
    List<Timetable> findByClassId(UUID classId);
    
    List<Timetable> findByClassIdAndDayOfWeek(UUID classId, DayOfWeek dayOfWeek);
    
    List<Timetable> findByTeacherId(UUID teacherId);
    
    List<Timetable> findByTeacherIdAndDayOfWeek(UUID teacherId, DayOfWeek dayOfWeek);
    
    List<Timetable> findBySubjectId(UUID subjectId);
    
    List<Timetable> findByClassIdAndIsActive(UUID classId, Boolean isActive);
}
