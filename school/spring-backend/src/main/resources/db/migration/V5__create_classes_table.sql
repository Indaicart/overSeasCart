-- V5__create_classes_table.sql
-- Creates the classes table

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    grade INTEGER NOT NULL,
    section VARCHAR(10),
    academic_year VARCHAR(50) NOT NULL,
    class_teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    room_number VARCHAR(20),
    max_students INTEGER DEFAULT 40,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_classes_name ON classes(name);
CREATE INDEX idx_classes_grade ON classes(grade);
CREATE INDEX idx_classes_academic_year ON classes(academic_year);
CREATE INDEX idx_classes_class_teacher_id ON classes(class_teacher_id);

