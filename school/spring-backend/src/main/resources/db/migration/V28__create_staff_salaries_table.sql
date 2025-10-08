-- V28__create_staff_salaries_table.sql
-- Creates the staff_salaries table for payroll management

CREATE TYPE payment_frequency AS ENUM ('monthly', 'weekly', 'bi_weekly', 'quarterly');

CREATE TABLE staff_salaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    
    -- Salary Details
    basic_salary DECIMAL(10, 2) NOT NULL,
    hra DECIMAL(10, 2) DEFAULT 0,
    da DECIMAL(10, 2) DEFAULT 0,
    ta DECIMAL(10, 2) DEFAULT 0,
    medical_allowance DECIMAL(10, 2) DEFAULT 0,
    other_allowances DECIMAL(10, 2) DEFAULT 0,
    
    -- Deductions
    pf DECIMAL(10, 2) DEFAULT 0,
    esi DECIMAL(10, 2) DEFAULT 0,
    professional_tax DECIMAL(10, 2) DEFAULT 0,
    tds DECIMAL(10, 2) DEFAULT 0,
    other_deductions DECIMAL(10, 2) DEFAULT 0,
    
    -- Calculated Fields
    gross_salary DECIMAL(10, 2) NOT NULL,
    net_salary DECIMAL(10, 2) NOT NULL,
    
    -- Payment Details
    payment_frequency payment_frequency DEFAULT 'monthly',
    pay_day INTEGER DEFAULT 1,
    effective_from DATE NOT NULL,
    effective_to DATE,
    
    -- Bank Details
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    account_holder_name VARCHAR(100),
    pan_number VARCHAR(20),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, effective_from)
);

CREATE INDEX idx_staff_salaries_school ON staff_salaries(school_id);
CREATE INDEX idx_staff_salaries_teacher ON staff_salaries(teacher_id);
CREATE INDEX idx_staff_salaries_active ON staff_salaries(is_active);
CREATE INDEX idx_staff_salaries_effective_from ON staff_salaries(effective_from);

