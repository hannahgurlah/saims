ALTER TABLE public.inventory_items
  ADD COLUMN IF NOT EXISTS year_acquired SMALLINT,
  ADD COLUMN IF NOT EXISTS office_type TEXT NOT NULL DEFAULT '';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_items_year_acquired_check' AND conrelid = 'public.inventory_items'::regclass) THEN
    ALTER TABLE public.inventory_items ADD CONSTRAINT inventory_items_year_acquired_check CHECK (year_acquired IS NULL OR year_acquired BETWEEN 1900 AND 2100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_items_office_type_check' AND conrelid = 'public.inventory_items'::regclass) THEN
    ALTER TABLE public.inventory_items ADD CONSTRAINT inventory_items_office_type_check CHECK (office_type IN ('', 'OSDS', 'SGOD', 'CID', 'HS', 'ES'));
  END IF;
END $$;

UPDATE public.inventory_items
SET office_type = CASE
  WHEN school_name ILIKE '%elementary school%' THEN 'ES'
  WHEN school_name ILIKE '%high school%' THEN 'HS'
  ELSE office_type
END
WHERE office_type = '';
