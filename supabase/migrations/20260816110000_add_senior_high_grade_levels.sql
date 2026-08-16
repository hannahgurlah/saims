ALTER TABLE public.inventory_items
  DROP CONSTRAINT IF EXISTS inventory_items_grade_level_check;

ALTER TABLE public.inventory_items
  ADD CONSTRAINT inventory_items_grade_level_check
  CHECK (grade_level IN ('', 'Kinder', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'));
