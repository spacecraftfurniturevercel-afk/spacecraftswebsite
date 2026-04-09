-- ─── Enquiries Table ──────────────────────────────────────────────────────────
-- Stores all enquiries: product, franchise, bulk_order, contact
-- type: 'product' | 'franchise' | 'bulk_order' | 'contact'
-- source: 'form' | 'whatsapp'
-- status: 'new' | 'acknowledged' | 'in_progress' | 'closed'

CREATE TABLE IF NOT EXISTS enquiries (
  id             BIGSERIAL PRIMARY KEY,
  type           TEXT NOT NULL CHECK (type IN ('product', 'franchise', 'bulk_order', 'contact')),
  source         TEXT NOT NULL DEFAULT 'form' CHECK (source IN ('form', 'whatsapp')),
  status         TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'in_progress', 'closed')),

  -- Common fields
  name           TEXT,
  email          TEXT,
  phone          TEXT,
  message        TEXT,

  -- Franchise-specific
  company_name       TEXT,
  gst_number         TEXT,
  city               TEXT,
  state              TEXT,
  investment_range   TEXT,
  space_available    TEXT,

  -- Bulk order-specific
  product_type   TEXT,
  quantity       TEXT,

  -- Product enquiry-specific
  product_id     INT REFERENCES products(id) ON DELETE SET NULL,
  product_name   TEXT,
  product_slug   TEXT,
  product_price  NUMERIC,

  -- Contact enquiry-specific
  subject        TEXT,

  -- Admin tracking
  admin_notes    TEXT,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by TEXT,

  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS enquiries_type_idx    ON enquiries(type);
CREATE INDEX IF NOT EXISTS enquiries_status_idx  ON enquiries(status);
CREATE INDEX IF NOT EXISTS enquiries_created_idx ON enquiries(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_enquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enquiries_updated_at_trigger ON enquiries;
CREATE TRIGGER enquiries_updated_at_trigger
  BEFORE UPDATE ON enquiries
  FOR EACH ROW EXECUTE FUNCTION update_enquiries_updated_at();

-- RLS: allow inserts from anon (public form submissions), read/update only by service role
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (submit an enquiry)
CREATE POLICY "enquiries_insert" ON enquiries FOR INSERT WITH CHECK (true);

-- Only authenticated users can read (admin uses service role, bypasses RLS)
CREATE POLICY "enquiries_select" ON enquiries FOR SELECT USING (auth.role() = 'authenticated');

-- Only authenticated users can update (admin acknowledges)
CREATE POLICY "enquiries_update" ON enquiries FOR UPDATE USING (auth.role() = 'authenticated');
