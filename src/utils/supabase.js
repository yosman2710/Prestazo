import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
const supabaseUrl = 'https://ruilmkncgykjvnqjpgop.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1aWxta25jZ3lranZucWpwZ29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNjA0NDMsImV4cCI6MjA4NzkzNjQ0M30._a8wChnn-JieQYNhxSE0RRoOWLCC7fBGCSLpOJmAr44';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    }
});