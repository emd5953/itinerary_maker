-- Add clerk_id column to users table for Clerk integration

-- Add the clerk_id column
ALTER TABLE users ADD COLUMN clerk_id VARCHAR(255);

-- Create unique index on clerk_id
CREATE UNIQUE INDEX idx_users_clerk_id ON users(clerk_id);

-- Update existing users with placeholder clerk_id (if any exist)
-- In production, you'd need to handle this migration more carefully
UPDATE users SET clerk_id = 'migration_' || id::text WHERE clerk_id IS NULL;

-- Make clerk_id NOT NULL after setting values
ALTER TABLE users ALTER COLUMN clerk_id SET NOT NULL;