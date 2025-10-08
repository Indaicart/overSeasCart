-- V25__create_activity_logs_table.sql
-- Creates the activity_logs table for audit trail

CREATE TYPE log_action AS ENUM ('create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import', 'payment', 'approval', 'rejection');

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action log_action NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_school ON activity_logs(school_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

