CREATE DATABASE careercompass_db;

\c careercompass_db;

-- Create extension if needed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE careercompass_db TO postgres;
