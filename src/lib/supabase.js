import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xhizkjkxqaonfsjrkcjm.supabase.co'
const supabaseAnonKey = 'sb_publishable_8e46z3Ryw7kTc-zs9q-vng_QHAItDDE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)