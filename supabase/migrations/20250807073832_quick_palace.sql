/*
  # Create trades table for trade journal

  1. New Tables
    - `trades`
      - `id` (uuid, primary key)
      - `pair` (text, currency pair like EUR/USD)
      - `order_type` (text, Buy or Sell)
      - `reason` (text, trade logic/reasoning)
      - `image_url` (text, optional image URL from Supabase Storage)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `trades` table
    - Add policy for public access (no auth required)

  3. Storage
    - Create storage bucket for trade images
*/

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pair text NOT NULL,
  order_type text NOT NULL CHECK (order_type IN ('Buy', 'Sell')),
  reason text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (no auth required)
CREATE POLICY "Allow public access to trades"
  ON trades
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for trade images
INSERT INTO storage.buckets (id, name, public)
VALUES ('trade-images', 'trade-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for public storage access
CREATE POLICY "Allow public uploads to trade-images"
  ON storage.objects
  FOR ALL
  TO anon
  USING (bucket_id = 'trade-images')
  WITH CHECK (bucket_id = 'trade-images');