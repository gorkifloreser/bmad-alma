-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_language TEXT,
  secondary_language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  modified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to create a profile for every new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to automatically update the modified_at timestamp
CREATE OR REPLACE FUNCTION public.update_modified_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.modified_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_modified_at_column();

-- RPC function to update user languages
DROP FUNCTION IF EXISTS public.update_user_languages(character varying, character varying);
DROP FUNCTION IF EXISTS public.update_user_languages(text, text);

CREATE OR REPLACE FUNCTION public.update_user_languages(p_primary_language TEXT, p_secondary_language TEXT)
RETURNS void AS $
BEGIN
  UPDATE public.profiles
  SET
    primary_language = p_primary_language,
    secondary_language = p_secondary_language
  WHERE id = auth.uid();
END;
$ LANGUAGE plpgsql;