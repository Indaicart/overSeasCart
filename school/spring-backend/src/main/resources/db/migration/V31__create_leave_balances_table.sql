-- V31__create_leave_balances_table.sql
-- Creates the leave_balances table

CREATE TABLE leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    leave_type_id UUID REFERENCES leave_types(id) ON DELETE CASCADE,
    
    year INTEGER NOT NULL,
    allocated DECIMAL(5, 1) NOT NULL,
    used DECIMAL(5, 1) DEFAULT 0,
    pending DECIMAL(5, 1) DEFAULT 0,
    available DECIMAL(5, 1) NOT NULL,
    carried_forward DECIMAL(5, 1) DEFAULT 0,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, leave_type_id, year)
);

CREATE INDEX idx_leave_balances_school_teacher_year ON leave_balances(school_id, teacher_id, year);

