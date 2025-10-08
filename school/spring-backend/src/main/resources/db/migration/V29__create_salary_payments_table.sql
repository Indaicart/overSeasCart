-- V29__create_salary_payments_table.sql
-- Creates the salary_payments table for salary payment tracking

CREATE TYPE salary_payment_method AS ENUM ('offline_cash', 'online_transfer', 'cheque', 'bank_transfer');
CREATE TYPE salary_payment_status AS ENUM ('pending', 'partial', 'paid', 'failed', 'cancelled');

CREATE TABLE salary_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    staff_salary_id UUID REFERENCES staff_salaries(id) ON DELETE CASCADE,
    
    -- Payment Period
    payment_month INTEGER NOT NULL CHECK (payment_month >= 1 AND payment_month <= 12),
    payment_year INTEGER NOT NULL,
    
    -- Amount Details
    gross_amount DECIMAL(10, 2) NOT NULL,
    deductions DECIMAL(10, 2) DEFAULT 0,
    net_amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    pending_amount DECIMAL(10, 2) NOT NULL,
    
    -- Payment Details
    payment_method salary_payment_method NOT NULL,
    payment_status salary_payment_status DEFAULT 'pending',
    payment_date DATE,
    paid_by UUID REFERENCES users(id),
    
    -- Offline Cash Payment
    offline_notes TEXT,
    receipt_number VARCHAR(100),
    
    -- Online Payment (Razorpay)
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    
    -- Salary Slip
    salary_breakdown JSONB,
    slip_number VARCHAR(100),
    slip_generated BOOLEAN DEFAULT false,
    
    -- Additional Details
    working_days INTEGER,
    present_days INTEGER,
    leave_days INTEGER,
    unpaid_leave_days DECIMAL(5, 1) DEFAULT 0,
    unpaid_leave_deduction DECIMAL(10, 2) DEFAULT 0,
    bonus DECIMAL(10, 2) DEFAULT 0,
    penalty DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, payment_month, payment_year)
);

CREATE INDEX idx_salary_payments_school ON salary_payments(school_id);
CREATE INDEX idx_salary_payments_teacher ON salary_payments(teacher_id);
CREATE INDEX idx_salary_payments_staff_salary ON salary_payments(staff_salary_id);
CREATE INDEX idx_salary_payments_status ON salary_payments(payment_status);
CREATE INDEX idx_salary_payments_month_year ON salary_payments(payment_month, payment_year);
CREATE INDEX idx_salary_payments_date ON salary_payments(payment_date);

