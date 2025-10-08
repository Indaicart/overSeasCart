-- V3__create_students_table.sql
-- Creates the students table

CREATE TYPE student_status AS ENUM ('active', 'inactive', 'graduated', 'transferred', 'suspended');

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    admission_number VARCHAR(50) UNIQUE,
    admission_date DATE NOT NULL,
    status student_status DEFAULT 'active',
    class_id UUID,
    section VARCHAR(10),
    roll_number VARCHAR(20),
    blood_group VARCHAR(10),
    medical_conditions TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_admission_number ON students(admission_number);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_user_id ON students(user_id);

