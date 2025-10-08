-- V10__create_fees_table.sql
-- Creates the fees table

CREATE TYPE fee_status AS ENUM ('pending', 'paid', 'overdue', 'waived', 'partial');
CREATE TYPE fee_type_enum AS ENUM ('tuition', 'transport', 'library', 'lab', 'exam', 'admission', 'annual', 'sports', 'other');

CREATE TABLE fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    fee_type fee_type_enum NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status fee_status DEFAULT 'pending',
    paid_date DATE,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fees_student_status ON fees(student_id, status);
CREATE INDEX idx_fees_due_date ON fees(due_date);
CREATE INDEX idx_fees_status ON fees(status);
CREATE INDEX idx_fees_transaction_id ON fees(transaction_id);

