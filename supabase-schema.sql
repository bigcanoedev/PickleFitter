-- Paddle Finder Database Schema
-- Run this in your Supabase SQL editor to set up the tables

CREATE TABLE paddles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  brand VARCHAR(100),
  price DECIMAL(10, 2),
  weight_oz DECIMAL(4, 2),
  swing_weight INTEGER,
  twist_weight DECIMAL(3, 1),
  face_material VARCHAR(50),
  avg_rating DECIMAL(3, 2),
  best_for VARCHAR(100),
  description TEXT,
  image_url VARCHAR(500),
  amazon_link VARCHAR(500),
  joola_link VARCHAR(500),
  franklin_link VARCHAR(500),
  paddletek_link VARCHAR(500),
  selkirk_link VARCHAR(500),
  generic_affiliate_link VARCHAR(500),
  preferred_link_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE quiz_responses (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(50),
  play_style VARCHAR(50),
  swing_speed VARCHAR(50),
  frustration VARCHAR(100),
  hand_size VARCHAR(50),
  moisture_level VARCHAR(50),
  budget VARCHAR(50),
  recommended_paddles JSONB,
  clicked_affiliate BOOLEAN DEFAULT FALSE,
  clicked_customizer BOOLEAN DEFAULT FALSE,
  clicked_lead_tape BOOLEAN DEFAULT FALSE,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE email_signups (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  recommended_paddle_id INTEGER,
  session_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
