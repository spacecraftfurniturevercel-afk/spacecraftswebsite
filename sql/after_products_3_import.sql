-- Run AFTER importing public/PRODUCTS_3_IMPORT.csv (10 rows).
-- Turn off base jf-5270; keep jf-5270-3f and jf-5270-4f only.

UPDATE products
SET is_active = false
WHERE lower(trim(sku)) = 'jf-5270';

-- Re-apply full live SKU allowlist (57 unique) — same as your client list
WITH allowlist(sku) AS (
  SELECT unnest(ARRAY[
    'jf-1400', 'jf-1020', 'jf-7040', 'jf-1155', 'jf-7090', 'jf-5900', 'jf-5909',
    'jf-9030', 'jf-9050', 'jf-9070', 'jf-9090', 'jf-7070', 'fw-4343', 'fw-5555',
    'fw-2255', 'jf-7020', 'jf-7190', 'fw-4545', 'jf-5250', 'jf-5240', 'jf-5270-3f',
    'jf-5270-4f', 'jf-5210-5f', 'jf-9020', 'jf-9040', 'jf-7180', 'jf-7080',
    'jf-5210-4f', 'jf-1010', 'jf-1155d', 'jf-1500', 'jf-1500wo', 'jf-5151',
    'jf-5010', 'jf-5020+5090', 'jf-1130', 'jf-1100', 'fw-2207', 'jf-7190c',
    'fw-4656', 'fw-5540', 'jf-5555', 'jf-5595', 'jf-5180', 'jf-5252', 'jf-9000',
    'jf-9060', 'jf-9005', 'jf-7050', 'jf-7200', 'fw-1155', 'fw-235', 'jf-1400wo',
    'jf-7700', 'jf-5900-k', 'jf-5909-k', 'jf-5151-k'
  ]::text[]) AS sku
)
UPDATE products p
SET is_active = EXISTS (
  SELECT 1 FROM allowlist a WHERE a.sku = lower(trim(p.sku))
);

SELECT COUNT(*) FILTER (WHERE is_active) AS active_count FROM products;
