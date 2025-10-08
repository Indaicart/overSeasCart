-- V2__create_schools_table.sql
-- Creates the schools table for multi-tenancy

CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    logo VARCHAR(500),
    principal_name VARCHAR(255),
    description TEXT,
    academic_year VARCHAR(50) NOT NULL,
    academic_year_start DATE NOT NULL,
    academic_year_end DATE NOT NULL,
    settings JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schools_name ON schools(name);

