ALTER TABLE public.inventory_items
  DROP CONSTRAINT IF EXISTS inventory_items_book_type_check;

UPDATE public.inventory_items
SET book_type = 'Standard Textbook'
WHERE book_type = 'Standard Textbooks';

ALTER TABLE public.inventory_items
  ADD CONSTRAINT inventory_items_book_type_check
  CHECK (book_type IN ('', 'Standard Textbook', 'Teachers Manual'));
