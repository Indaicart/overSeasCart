package com.schoolms.entity;

import com.schoolms.enums.DayOfWeek;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "timetable", indexes = {
    @Index(name = "idx_timetable_class_day", columnList = "class_id, day_of_week"),
    @Index(name = "idx_timetable_teacher_day", columnList = "teacher_id, day_of_week"),
    @Index(name = "idx_timetable_subject", columnList = "subject_id")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Timetable extends BaseEntity {
    
    @Column(name = "class_id", columnDefinition = "UUID")
    private UUID classId;
    
    @Column(name = "subject_id", columnDefinition = "UUID")
    private UUID subjectId;
    
    @Column(name = "teacher_id", columnDefinition = "UUID")
    private UUID teacherId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false, length = 20)
    private DayOfWeek dayOfWeek;
    
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;
    
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;
    
    @Column(length = 50)
    private String room;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", insertable = false, updatable = false)
    private Class timetableClass;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", insertable = false, updatable = false)
    private Subject subject;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", insertable = false, updatable = false)
    private Teacher teacher;
}
