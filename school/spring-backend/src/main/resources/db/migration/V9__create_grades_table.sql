-- V9__create_grades_table.sql
-- Creates the grades table

CREATE TYPE assessment_type AS ENUM ('exam', 'quiz', 'assignment', 'project', 'practical', 'test', 'midterm', 'final');

CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    assessment_type assessment_type NOT NULL,
    assessment_name VARCHAR(255) NOT NULL,
    marks_obtained DECIMAL(5, 2) NOT NULL,
    total_marks DECIMAL(5, 2) NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL,
    grade_letter VARCHAR(5),
    gpa DECIMAL(3, 2),
    assessment_date DATE NOT NULL,
    comments TEXT,
    graded_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_grades_student_subject ON grades(student_id, subject_id);
CREATE INDEX idx_grades_class_date ON grades(class_id, assessment_date);
CREATE INDEX idx_grades_assessment_type ON grades(assessment_type);
CREATE INDEX idx_grades_assessment_date ON grades(assessment_date);

