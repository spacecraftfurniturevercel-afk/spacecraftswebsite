-- ============================================
-- EXTENDED SCHEMA FOR REVIEWS & Q&A
-- Add this to your existing Supabase schema
-- Run in Supabase SQL Editor
-- ============================================

-- ============================================
-- ENHANCE PROFILES TABLE (if not already done)
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS postal_code text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country text DEFAULT 'India';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_purchase boolean DEFAULT false;

-- ============================================
-- BACKWARD COMPATIBILITY: REVIEWS TABLE
-- If an older reviews table exists with profile_id (from schema.sql),
-- add the newer columns and hydrate user_id from profile_id.
-- ============================================
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id uuid references profiles(id) on delete cascade;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status text default 'pending';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS helpful_count int default 0;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS unhelpful_count int default 0;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS verified_purchase boolean default false;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();

-- Populate user_id from legacy profile_id if present
UPDATE reviews SET user_id = profile_id WHERE user_id IS NULL AND profile_id IS NOT NULL;

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id serial primary key,
  product_id int references products(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  title text not null,
  body text not null,
  helpful_count int default 0,
  unhelpful_count int default 0,
  verified_purchase boolean default false,
  status text default 'pending', -- pending, approved, rejected
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product on reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user on reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status on reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created on reviews(created_at DESC);

-- ============================================
-- PRODUCT Q&A TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS product_qa (
  id serial primary key,
  product_id int references products(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  question text not null,
  answer text,
  answer_by uuid references profiles(id) on delete set null, -- admin who answered
  is_helpful_for_others boolean default false,
  views_count int default 0,
  status text default 'published', -- published, hidden
  created_at timestamptz default now(),
  answered_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_product_qa_product on product_qa(product_id);
CREATE INDEX IF NOT EXISTS idx_product_qa_user on product_qa(user_id);
CREATE INDEX IF NOT EXISTS idx_product_qa_answered on product_qa(answer DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_product_qa_created on product_qa(created_at DESC);

-- ============================================
-- HELPFUL VOTES TABLE (for reviews)
-- ============================================
CREATE TABLE IF NOT EXISTS review_votes (
  id serial primary key,
  review_id int references reviews(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  vote_type text not null, -- 'helpful' or 'unhelpful'
  created_at timestamptz default now(),
  unique (review_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_review_votes_review on review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user on review_votes(user_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- ENABLE RLS ON TABLES
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_qa ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

-- REVIEWS POLICIES
-- Anyone can read approved reviews
CREATE POLICY "Reviews: read approved" ON reviews
  FOR SELECT USING (status = 'approved');

-- Users can read all reviews (including own pending ones)
CREATE POLICY "Reviews: read own and approved" ON reviews
  FOR SELECT USING (auth.uid() = user_id OR status = 'approved');

-- Users can create reviews
CREATE POLICY "Reviews: create own" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update own reviews
CREATE POLICY "Reviews: update own" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin can approve/reject reviews (requires custom claim)
CREATE POLICY "Reviews: admin manage" ON reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND email LIKE '%@admin%'
    )
  );

-- Q&A POLICIES
-- Anyone can read published Q&A
CREATE POLICY "QA: read published" ON product_qa
  FOR SELECT USING (status = 'published');

-- Users can create questions
CREATE POLICY "QA: create own" ON product_qa
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can see their own questions
CREATE POLICY "QA: read own" ON product_qa
  FOR SELECT USING (auth.uid() = user_id OR status = 'published');

-- Admin can answer questions
CREATE POLICY "QA: admin reply" ON product_qa
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND email LIKE '%@admin%'
    )
  );

-- REVIEW VOTES POLICIES
CREATE POLICY "Review votes: create own" ON review_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Review votes: read all" ON review_votes
  FOR SELECT USING (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update review rating average
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET rating = (
    SELECT COALESCE(AVG(rating::numeric), 0)::numeric(2,1)
    FROM reviews
    WHERE product_id = NEW.product_id AND status = 'approved'
  ),
  review_count = (
    SELECT COUNT(*)
    FROM reviews
    WHERE product_id = NEW.product_id AND status = 'approved'
  )
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for review updates
DROP TRIGGER IF EXISTS trigger_update_product_rating ON reviews;
CREATE TRIGGER trigger_update_product_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Function to update review helpful counts
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.vote_type = 'helpful' THEN
    UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
  ELSE
    UPDATE reviews SET unhelpful_count = unhelpful_count + 1 WHERE id = NEW.review_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for helpful votes
DROP TRIGGER IF EXISTS trigger_update_review_helpful ON review_votes;
CREATE TRIGGER trigger_update_review_helpful
AFTER INSERT ON review_votes
FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

-- Function to track Q&A views
CREATE OR REPLACE FUNCTION increment_qa_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE product_qa SET views_count = views_count + 1 WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

