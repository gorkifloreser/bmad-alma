CREATE TABLE public.brand_heart (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mission TEXT,
    vision TEXT,
    values TEXT,
    tone_of_voice TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.brand_heart ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own brand heart" ON public.brand_heart
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brand heart" ON public.brand_heart
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand heart" ON public.brand_heart
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
