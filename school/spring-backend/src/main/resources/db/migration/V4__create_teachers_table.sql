-- V4__create_teachers_table.sql
-- Creates the teachers table

CREATE TYPE teacher_status AS ENUM ('active', 'inactive', 'on_leave', 'terminated');
CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contract', 'substitute');

CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    teacher_id VARCHAR(50) UNIQUE NOT NULL,
    employee_number VARCHAR(50) UNIQUE,
    date_of_joining DATE NOT NULL,
    status teacher_status DEFAULT 'active',
    employment_type employment_type DEFAULT 'full_time',
    qualification VARCHAR(255),
    specialization VARCHAR(255),
    experience_years INTEGER,
    class_teacher_for UUID, -- References classes table
    subjects_teaching TEXT[], -- Array of subject IDs they teach
    salary_grade VARCHAR(50),
    bank_account_number VARCHAR(50),
    bank_name VARCHAR(255),
    bank_ifsc VARCHAR(20),
    pan_number VARCHAR(20),
    aadhar_number VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teachers_teacher_id ON teachers(teacher_id);
CREATE INDEX idx_teachers_employee_number ON teachers(employee_number);
CREATE INDEX idx_teachers_user_id ON teachers(user_id);
CREATE INDEX idx_teachers_status ON teachers(status);
CREATE INDEX idx_teachers_class_teacher_for ON teachers(class_teacher_for);

