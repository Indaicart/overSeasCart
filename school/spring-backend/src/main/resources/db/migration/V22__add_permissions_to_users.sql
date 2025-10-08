-- V22__add_permissions_to_users.sql
-- Adds permissions field to users for internal admin management

ALTER TABLE users ADD COLUMN permissions JSONB;
CREATE INDEX idx_users_permissions ON users USING GIN(permissions);

