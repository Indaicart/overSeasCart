-- V21__add_school_code.sql
-- Adds unique school code for two-step login

ALTER TABLE schools ADD COLUMN school_code VARCHAR(20) UNIQUE;
CREATE INDEX idx_schools_school_code ON schools(school_code);

