-- V18__create_subscription_plans_table.sql
-- Creates the subscription_plans table for dynamic plan management

CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    monthly_price DECIMAL(10, 2) NOT NULL,
    annual_price DECIMAL(10, 2),
    max_students INTEGER DEFAULT 100,
    max_teachers INTEGER DEFAULT 20,
    max_storage_gb INTEGER DEFAULT 5,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    features JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscription_plans_code ON subscription_plans(code);
CREATE INDEX idx_subscription_plans_is_active ON subscription_plans(is_active);

