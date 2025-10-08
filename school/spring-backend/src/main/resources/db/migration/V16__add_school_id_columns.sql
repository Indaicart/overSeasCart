-- V16__add_school_id_columns.sql
-- Adds school_id to users, students, teachers, classes, subjects for multi-tenancy

ALTER TABLE users ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE students ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE teachers ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE classes ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE subjects ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;

CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_students_school_id ON students(school_id);
CREATE INDEX idx_teachers_school_id ON teachers(school_id);
CREATE INDEX idx_classes_school_id ON classes(school_id);
CREATE INDEX idx_subjects_school_id ON subjects(school_id);

