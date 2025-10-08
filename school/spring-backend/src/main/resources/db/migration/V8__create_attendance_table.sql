-- V8__create_attendance_table.sql
-- Creates the attendance table

CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused', 'half_day');

CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    status attendance_status NOT NULL,
    remarks TEXT,
    marked_by UUID REFERENCES users(id),
    attendance_type VARCHAR(20) DEFAULT 'class', -- 'class' or 'subject'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX idx_attendance_class_date ON attendance(class_id, date);
CREATE INDEX idx_attendance_subject_date ON attendance(subject_id, date);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_status ON attendance(status);

-- Unique constraint for class attendance
CREATE UNIQUE INDEX idx_attendance_student_date_class 
ON attendance(student_id, date, class_id) 
WHERE attendance_type = 'class';

-- Unique constraint for subject attendance
CREATE UNIQUE INDEX idx_attendance_student_date_subject 
ON attendance(student_id, date, subject_id) 
WHERE attendance_type = 'subject';

