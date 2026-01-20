-- Migration: Add multi-day race support and elevation field
-- Run this in Supabase SQL Editor if you already have the races table

-- Add new columns for multi-day races and elevation
ALTER TABLE races 
ADD COLUMN IF NOT EXISTS is_multi_day BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS day_distances JSONB,
ADD COLUMN IF NOT EXISTS elevation INTEGER; -- in meters

-- Add comment for documentation
COMMENT ON COLUMN races.is_multi_day IS 'Whether this race spans multiple days';
COMMENT ON COLUMN races.day_distances IS 'Array of day distances: [{"day": 1, "distance": 10000, "actualDistance": 10100}, ...]';
COMMENT ON COLUMN races.elevation IS 'Total elevation gain in meters (for trail races)';
