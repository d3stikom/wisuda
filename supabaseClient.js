import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ukoyjzliygwmmtpbknmu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrb3lqemxpeWd3bW10cGJrbm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNzg3ODYsImV4cCI6MjA2OTg1NDc4Nn0.EbRBAlzgTLxEEqP_FuvwtJJBd3xRDMPy7Htr6PQHyEM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
