-- V13__create_notifications_table.sql
-- Creates the notifications table

CREATE TYPE notification_type AS ENUM ('info', 'warning', 'success', 'error');
CREATE TYPE notification_category AS ENUM ('attendance', 'grades', 'fees', 'general', 'emergency', 'event', 'announcement');

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'info',
    category notification_category DEFAULT 'general',
    is_read BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_category ON notifications(category);

