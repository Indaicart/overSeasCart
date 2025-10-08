-- V32__create_leave_applications_table.sql
-- Creates the leave_applications table

CREATE TYPE leave_day_type AS ENUM ('full_day', 'first_half', 'second_half');
CREATE TYPE leave_application_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

CREATE TABLE leave_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    leave_type_id UUID REFERENCES leave_types(id) ON DELETE CASCADE,
    
    -- Application Details
    application_number VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(5, 1) NOT NULL,
    day_type leave_day_type DEFAULT 'full_day',
    
    reason TEXT NOT NULL,
    contact_during_leave VARCHAR(15),
    attachment_url TEXT,
    
    -- Approval Workflow
    status leave_application_status DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP,
    review_comments TEXT,
    
    -- Flags
    is_emergency BOOLEAN DEFAULT false,
    affects_salary BOOLEAN DEFAULT false,
    salary_deduction_days DECIMAL(5, 1) DEFAULT 0,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leave_applications_school_teacher_status ON leave_applications(school_id, teacher_id, status);
CREATE INDEX idx_leave_applications_dates ON leave_applications(start_date, end_date);
CREATE INDEX idx_leave_applications_number ON leave_applications(application_number);

