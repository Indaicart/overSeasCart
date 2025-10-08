-- V11__create_parents_table.sql
-- Creates the parents table

CREATE TYPE relationship_type AS ENUM ('father', 'mother', 'guardian', 'grandfather', 'grandmother', 'uncle', 'aunt', 'other');

CREATE TABLE parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    occupation VARCHAR(255),
    workplace VARCHAR(255),
    work_phone VARCHAR(20),
    relationship_to_student relationship_type NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_parents_user_id ON parents(user_id);

