-- Migration: Add duathlon customizable discipline fields
-- Run this in Supabase SQL Editor if you already have the races table

-- Add new columns for customizable duathlon disciplines
ALTER TABLE races 
ADD COLUMN IF NOT EXISTS first_discipline TEXT CHECK (first_discipline IN ('carrera', 'ciclismo', 'natación')),
ADD COLUMN IF NOT EXISTS second_discipline TEXT CHECK (second_discipline IN ('carrera', 'ciclismo', 'natación')),
ADD COLUMN IF NOT EXISTS first_discipline_data JSONB,
ADD COLUMN IF NOT EXISTS second_discipline_data JSONB,
ADD COLUMN IF NOT EXISTS first_discipline_time TEXT,
ADD COLUMN IF NOT EXISTS second_discipline_time TEXT;
