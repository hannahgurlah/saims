ALTER TABLE public.inventory_items
  ADD COLUMN IF NOT EXISTS book_type TEXT NOT NULL DEFAULT '';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'inventory_items_book_type_check'
      AND conrelid = 'public.inventory_items'::regclass
  ) THEN
    ALTER TABLE public.inventory_items
      ADD CONSTRAINT inventory_items_book_type_check
      CHECK (book_type IN ('', 'Standard Textbook', 'Teachers Manual'));
  END IF;
END $$;
