import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fbpqburqpmzgkedwcpct.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicHFidXJxcG16Z2tlZHdjcGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTgwMzQsImV4cCI6MjA3MDEzNDAzNH0.AL-URrp7YmNmFzSoAQjaGv0i7dKe1P3J3Tq9p8Eq1OM';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Trade = {
  id: string;
  pair: string;
  order_type: 'Buy' | 'Sell';
  reason: string;
  image_url?: string;
  trade_result: 'Win' | 'Loss' | 'Pending';
  created_at: string;
};