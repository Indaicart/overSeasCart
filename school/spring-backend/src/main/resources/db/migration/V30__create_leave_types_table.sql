-- V30__create_leave_types_table.sql
-- Creates the leave_types table

CREATE TABLE leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    
    annual_quota INTEGER NOT NULL,
    is_paid BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT true,
    allow_half_day BOOLEAN DEFAULT true,
    can_carry_forward BOOLEAN DEFAULT false,
    max_carry_forward_days INTEGER DEFAULT 0,
    min_days_notice INTEGER DEFAULT 0,
    max_consecutive_days INTEGER,
    
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(school_id, code)
);

CREATE INDEX idx_leave_types_school_active ON leave_types(school_id, is_active);

