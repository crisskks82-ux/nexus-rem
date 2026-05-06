import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ddnlenbxnoqgnlsaokfq.supabase.co'
const supabaseAnonKey = 'sb_publishable_UplsYvdMjwjKt5fJYiytCQ_HxwHWJ1k'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)