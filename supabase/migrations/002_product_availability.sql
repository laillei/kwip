-- supabase/migrations/002_product_availability.sql

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_verified_at DATE,
  ADD COLUMN IF NOT EXISTS unavailable_since DATE;

-- Index for active product filtering (most queries will use this)
CREATE INDEX IF NOT EXISTS products_is_active_idx ON products (is_active);
