-- V27__create_payments_table.sql
-- Creates the payments table for Razorpay integration

CREATE TYPE payment_type_enum AS ENUM ('school_subscription', 'student_fee', 'admission_fee', 'staff_salary', 'other');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'success', 'failed', 'refunded', 'cancelled');
CREATE TYPE payment_method_enum AS ENUM ('card', 'netbanking', 'upi', 'wallet', 'cash', 'cheque', 'bank_transfer');

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    fee_id UUID REFERENCES fees(id) ON DELETE SET NULL,
    
    -- Payment details
    payment_type payment_type_enum NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status payment_status_enum DEFAULT 'pending',
    
    -- Razorpay details
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    
    -- Transaction details
    payment_method payment_method_enum,
    description TEXT,
    metadata JSONB,
    receipt_number VARCHAR(100),
    
    -- Refund details
    refund_id VARCHAR(100),
    refund_amount DECIMAL(10, 2),
    refund_date TIMESTAMP,
    refund_reason TEXT,
    
    -- Error tracking
    error_message TEXT,
    error_code VARCHAR(50),
    
    -- Timestamps
    payment_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_school ON payments(school_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_fee ON payments(fee_id);
CREATE INDEX idx_payments_razorpay_order ON payments(razorpay_order_id);
CREATE INDEX idx_payments_razorpay_payment ON payments(razorpay_payment_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_type ON payments(payment_type);
CREATE INDEX idx_payments_receipt ON payments(receipt_number);

