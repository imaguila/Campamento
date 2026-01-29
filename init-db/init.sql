-- Create a dedicated schema for the Camp Management System
CREATE SCHEMA IF NOT EXISTS camp_system;

-- Create a non-superuser for the Application to follow security best practices
-- The POSTGRES_USER from the env will be the superuser
CREATE USER camp_app_user WITH PASSWORD 'camp_secure_pass';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE camp_db TO camp_app_user;
GRANT ALL ON SCHEMA camp_system TO camp_app_user;

-- Initial tables for Sprint 1 (Camper and Parent management)
CREATE TABLE camp_system.parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE camp_system.campers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES camp_system.parents(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    medical_info TEXT,
    emergency_contact VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);