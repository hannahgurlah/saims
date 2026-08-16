ALTER TABLE public.inventory_items
  ADD COLUMN IF NOT EXISTS grade_level TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS subject_area TEXT NOT NULL DEFAULT '';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'inventory_items_grade_level_check'
      AND conrelid = 'public.inventory_items'::regclass
  ) THEN
    ALTER TABLE public.inventory_items
      ADD CONSTRAINT inventory_items_grade_level_check
      CHECK (grade_level IN ('', 'Kinder', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'));
  END IF;
END $$;
