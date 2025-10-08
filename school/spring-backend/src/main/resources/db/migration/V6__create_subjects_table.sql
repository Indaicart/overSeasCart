-- V6__create_subjects_table.sql
-- Creates the subjects table

CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    department VARCHAR(100),
    credits INTEGER DEFAULT 1,
    is_core BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subjects_code ON subjects(code);
CREATE INDEX idx_subjects_department ON subjects(department);
CREATE INDEX idx_subjects_is_active ON subjects(is_active);

