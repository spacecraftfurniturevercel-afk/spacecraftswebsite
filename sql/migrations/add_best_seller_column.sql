-- Migration: Add best_seller column to products table
-- Run this in Supabase SQL Editor if products table already exists

ALTER TABLE products ADD COLUMN IF NOT EXISTS best_seller boolean DEFAULT false;

-- Create index for filtering bestsellers
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(best_seller) WHERE best_seller = true;
