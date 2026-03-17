-- supabase/migrations/001_initial_schema.sql

-- Concerns table
CREATE TABLE IF NOT EXISTS concerns (
  id TEXT PRIMARY KEY,
  label JSONB NOT NULL,
  symptom JSONB NOT NULL,
  icon TEXT,
  key_ingredients TEXT[] NOT NULL DEFAULT '{}',
  weather_trigger JSONB
);

-- Ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY,
  name JSONB NOT NULL,
  description JSONB,
  effects JSONB NOT NULL DEFAULT '[]',
  ewg_grade TEXT,
  category TEXT NOT NULL
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name JSONB NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  concerns TEXT[] NOT NULL DEFAULT '{}',
  ingredients JSONB NOT NULL DEFAULT '[]',
  popularity JSONB NOT NULL,
  purchase JSONB NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}'
);

-- Index for concern-based filtering (most common query)
CREATE INDEX IF NOT EXISTS products_concerns_idx ON products USING GIN (concerns);
CREATE INDEX IF NOT EXISTS products_brand_idx ON products (brand);
CREATE INDEX IF NOT EXISTS products_category_idx ON products (category);
CREATE INDEX IF NOT EXISTS products_popularity_rank_idx ON products ((popularity->>'rank'));

-- RLS: Enable row level security
ALTER TABLE concerns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS: Public read access (no auth required for browsing)
CREATE POLICY "Public read concerns" ON concerns FOR SELECT USING (true);
CREATE POLICY "Public read ingredients" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
