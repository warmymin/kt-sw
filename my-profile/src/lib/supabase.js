import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 디버깅용 로그
if (typeof window !== 'undefined') {
  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Key exists:', !!supabaseAnonKey)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 