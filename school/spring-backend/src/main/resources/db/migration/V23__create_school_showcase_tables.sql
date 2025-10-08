-- V23__create_school_showcase_tables.sql
-- Creates tables for school showcase feature

CREATE TYPE achievement_category AS ENUM ('academic', 'sports', 'cultural', 'social', 'other');
CREATE TYPE event_type AS ENUM ('sports_day', 'annual_day', 'cultural_fest', 'independence_day', 'republic_day', 'festival', 'workshop', 'other');

CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category achievement_category NOT NULL,
    achievement_date DATE NOT NULL,
    participants TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gallery_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    photo_url VARCHAR(500) NOT NULL,
    event_type event_type NOT NULL,
    event_date DATE,
    uploaded_by UUID REFERENCES users(id),
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type event_type NOT NULL,
    event_date DATE NOT NULL,
    location VARCHAR(255),
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_role VARCHAR(100),
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_achievements_school ON achievements(school_id);
CREATE INDEX idx_gallery_photos_school ON gallery_photos(school_id);
CREATE INDEX idx_events_school ON events(school_id);
CREATE INDEX idx_testimonials_school ON testimonials(school_id);

