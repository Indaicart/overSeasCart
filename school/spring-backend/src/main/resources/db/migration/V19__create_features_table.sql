-- V19__create_features_table.sql
-- Creates the features table for dynamic feature management

CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50),
    is_enabled BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_features_code ON features(code);
CREATE INDEX idx_features_is_enabled ON features(is_enabled);
CREATE INDEX idx_features_category ON features(category);

