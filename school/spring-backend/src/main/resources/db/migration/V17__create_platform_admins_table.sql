-- V17__create_platform_admins_table.sql
-- Creates the platform_admins table for super admins

CREATE TABLE platform_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_super_admin BOOLEAN DEFAULT true,
    permissions JSONB,
    last_active TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_platform_admins_user_id ON platform_admins(user_id);

