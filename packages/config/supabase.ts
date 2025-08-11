import { createClient } from '@supabase/supabase-js'

// These variables are placeholders and will be loaded from
// environment variables in the respective applications.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
