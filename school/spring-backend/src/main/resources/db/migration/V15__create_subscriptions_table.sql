-- V15__create_subscriptions_table.sql
-- Creates the subscriptions table for school plans

CREATE TYPE plan_type AS ENUM ('basic', 'standard', 'premium', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'suspended', 'cancelled', 'trial');
CREATE TYPE billing_cycle AS ENUM ('monthly', 'annual', 'quarterly');

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    plan_type plan_type NOT NULL,
    status subscription_status DEFAULT 'trial',
    start_date DATE NOT NULL,
    end_date DATE,
    trial_end_date DATE,
    monthly_price DECIMAL(10, 2) NOT NULL,
    annual_price DECIMAL(10, 2),
    billing_cycle billing_cycle DEFAULT 'monthly',
    max_students INTEGER DEFAULT 100,
    max_teachers INTEGER DEFAULT 20,
    max_storage_gb INTEGER DEFAULT 5,
    has_advanced_analytics BOOLEAN DEFAULT false,
    has_custom_branding BOOLEAN DEFAULT false,
    has_api_access BOOLEAN DEFAULT false,
    has_priority_support BOOLEAN DEFAULT false,
    features JSONB,
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_school ON subscriptions(school_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan_type ON subscriptions(plan_type);

