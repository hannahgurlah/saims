ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS acquisition_type TEXT NOT NULL DEFAULT 'Purchase',
  ADD COLUMN IF NOT EXISTS property_condition TEXT NOT NULL DEFAULT 'Working/Available';
