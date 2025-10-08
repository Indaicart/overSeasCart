-- V24__create_surveys_and_quizzes_tables.sql
-- Creates tables for surveys and quizzes feature

CREATE TYPE survey_type_enum AS ENUM ('survey', 'quiz');
CREATE TYPE target_audience AS ENUM ('teachers', 'students', 'both', 'parents');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false', 'short_answer', 'essay', 'rating');
CREATE TYPE survey_status AS ENUM ('draft', 'published', 'closed');

CREATE TABLE surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    survey_type survey_type_enum NOT NULL,
    target_audience target_audience NOT NULL,
    is_graded BOOLEAN DEFAULT false,
    total_marks INTEGER DEFAULT 0,
    passing_marks INTEGER DEFAULT 0,
    time_limit_minutes INTEGER,
    status survey_status DEFAULT 'draft',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE survey_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL,
    options JSONB, -- For multiple choice: ["A", "B", "C", "D"]
    correct_answer TEXT, -- For quizzes
    marks INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    answers JSONB NOT NULL, -- {question_id: answer}
    score INTEGER,
    percentage DECIMAL(5, 2),
    is_graded BOOLEAN DEFAULT false,
    graded_by UUID REFERENCES users(id),
    graded_at TIMESTAMP,
    feedback TEXT,
    time_taken_minutes INTEGER,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_surveys_school ON surveys(school_id);
CREATE INDEX idx_surveys_status ON surveys(status);
CREATE INDEX idx_survey_questions_survey ON survey_questions(survey_id);
CREATE INDEX idx_survey_responses_survey ON survey_responses(survey_id);
CREATE INDEX idx_survey_responses_user ON survey_responses(user_id);

