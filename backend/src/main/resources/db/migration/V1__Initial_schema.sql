-- Initial schema for aSpot Itinerary Planning Application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User preferences (embedded in users table)
CREATE TABLE user_interests (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    interest VARCHAR(100) NOT NULL,
    PRIMARY KEY (user_id, interest)
);

CREATE TABLE user_dietary_restrictions (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    restriction VARCHAR(100) NOT NULL,
    PRIMARY KEY (user_id, restriction)
);

-- Add preference columns to users table
ALTER TABLE users ADD COLUMN budget_level VARCHAR(20) DEFAULT 'MID_RANGE';
ALTER TABLE users ADD COLUMN travel_style VARCHAR(20) DEFAULT 'RELAXED';
ALTER TABLE users ADD COLUMN preferred_transport VARCHAR(20) DEFAULT 'PUBLIC';

-- Itineraries table
CREATE TABLE itineraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Itinerary collaborators (many-to-many)
CREATE TABLE itinerary_collaborators (
    itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (itinerary_id, user_id)
);

-- Day plans table
CREATE TABLE day_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    itinerary_id UUID NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
    notes TEXT
);

-- Activities table (master data)
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address VARCHAR(500),
    city VARCHAR(100),
    country VARCHAR(100),
    place_id VARCHAR(255),
    rating DECIMAL(3, 2),
    review_count INTEGER DEFAULT 0,
    price_range VARCHAR(20),
    website_url VARCHAR(500),
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activity tags (many-to-many)
CREATE TABLE activity_tags (
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    PRIMARY KEY (activity_id, tag)
);

-- Activity images
CREATE TABLE activity_images (
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    PRIMARY KEY (activity_id, image_url)
);

-- Scheduled activities (activities added to itineraries)
CREATE TABLE scheduled_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    day_plan_id UUID NOT NULL REFERENCES day_plans(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address VARCHAR(500),
    city VARCHAR(100),
    country VARCHAR(100),
    place_id VARCHAR(255),
    start_time TIME,
    end_time TIME,
    estimated_duration INTERVAL,
    website_url VARCHAR(500),
    rating DECIMAL(3, 2),
    price_range VARCHAR(20)
);

-- Scheduled activity tags
CREATE TABLE scheduled_activity_tags (
    scheduled_activity_id UUID REFERENCES scheduled_activities(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    PRIMARY KEY (scheduled_activity_id, tag)
);

-- Collaboration sessions
CREATE TABLE collaboration_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    itinerary_id UUID UNIQUE NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Session collaborators (many-to-many)
CREATE TABLE session_collaborators (
    collaboration_session_id UUID REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (collaboration_session_id, user_id)
);

-- Proposals
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    collaboration_session_id UUID NOT NULL REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    proposed_activity_id UUID REFERENCES scheduled_activities(id) ON DELETE CASCADE,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Votes
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vote_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(proposal_id, voter_id)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_itineraries_owner ON itineraries(owner_id);
CREATE INDEX idx_itineraries_dates ON itineraries(start_date, end_date);
CREATE INDEX idx_day_plans_itinerary ON day_plans(itinerary_id);
CREATE INDEX idx_day_plans_date ON day_plans(date);
CREATE INDEX idx_activities_destination ON activities(destination);
CREATE INDEX idx_activities_category ON activities(category);
CREATE INDEX idx_activities_location ON activities(latitude, longitude);
CREATE INDEX idx_scheduled_activities_day_plan ON scheduled_activities(day_plan_id);
CREATE INDEX idx_scheduled_activities_time ON scheduled_activities(start_time);
CREATE INDEX idx_proposals_session ON proposals(collaboration_session_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_votes_proposal ON votes(proposal_id);