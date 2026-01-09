-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create races table
CREATE TABLE IF NOT EXISTS races (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  race_type TEXT NOT NULL CHECK (race_type IN ('calle', 'trail', 'montaña', 'postas', 'natación', 'triatlón', 'duatlón', 'otro')),
  distance INTEGER NOT NULL, -- in meters
  actual_distance INTEGER, -- in meters
  -- Triathlon/Duathlon fields (stored as JSONB)
  swimming_distance JSONB,
  cycling_distance JSONB,
  running_distance JSONB,
  first_run_distance JSONB,
  transition1_time JSONB,
  transition2_time JSONB,
  -- Times
  target_time TEXT, -- HH:MM:SS format
  actual_time TEXT, -- HH:MM:SS format
  swimming_time TEXT,
  cycling_time TEXT,
  running_time TEXT,
  first_run_time TEXT,
  -- Other fields
  priority TEXT NOT NULL CHECK (priority IN ('máxima', 'alta', 'media', 'baja', 'ninguna')),
  goal TEXT NOT NULL CHECK (goal IN ('completar', 'tiempo', 'disfrutar', 'ninguno')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_races_user_id ON races(user_id);
CREATE INDEX IF NOT EXISTS idx_races_date ON races(date);
CREATE INDEX IF NOT EXISTS idx_races_user_date ON races(user_id, date);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE races ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for races
CREATE POLICY "Users can view their own races"
  ON races FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own races"
  ON races FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own races"
  ON races FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own races"
  ON races FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_races_updated_at
  BEFORE UPDATE ON races
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
