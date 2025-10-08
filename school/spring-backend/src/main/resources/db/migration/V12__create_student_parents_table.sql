-- V12__create_student_parents_table.sql
-- Creates the junction table for student-parent relationships

CREATE TABLE student_parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    relationship relationship_type NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    can_pickup BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, parent_id)
);

CREATE INDEX idx_student_parents_student ON student_parents(student_id);
CREATE INDEX idx_student_parents_parent ON student_parents(parent_id);
CREATE INDEX idx_student_parents_primary ON student_parents(is_primary);

