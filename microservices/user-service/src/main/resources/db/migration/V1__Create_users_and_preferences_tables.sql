-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    clerk_user_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    budget_level VARCHAR(50) DEFAULT 'MID_RANGE',
    travel_style VARCHAR(50) DEFAULT 'BALANCED',
    preferred_transport VARCHAR(100) DEFAULT 'walking',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create user_interests table (for storing list of interests)
CREATE TABLE user_interests (
    preferences_id UUID NOT NULL REFERENCES user_preferences(id) ON DELETE CASCADE,
    interest VARCHAR(100) NOT NULL,
    PRIMARY KEY (preferences_id, interest)
);

-- Create user_dietary_restrictions table
CREATE TABLE user_dietary_restrictions (
    preferences_id UUID NOT NULL REFERENCES user_preferences(id) ON DELETE CASCADE,
    restriction VARCHAR(100) NOT NULL,
    PRIMARY KEY (preferences_id, restriction)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX idx_preferences_user_id ON user_preferences(user_id);

-- Insert a demo user for testing
INSERT INTO users (id, email, name, clerk_user_id) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'demo@example.com', 'Demo User', 'demo_clerk_id');

-- Insert default preferences for demo user
INSERT INTO user_preferences (id, user_id, budget_level, travel_style, preferred_transport)
VALUES ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'MID_RANGE', 'BALANCED', 'walking');

-- Insert default interests for demo user
INSERT INTO user_interests (preferences_id, interest) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'museums'),
('550e8400-e29b-41d4-a716-446655440001', 'restaurants'),
('550e8400-e29b-41d4-a716-446655440001', 'parks');