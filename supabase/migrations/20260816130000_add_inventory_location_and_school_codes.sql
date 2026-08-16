ALTER TABLE public.inventory_items
  ADD COLUMN IF NOT EXISTS location_code TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS school_code TEXT NOT NULL DEFAULT '';

UPDATE public.inventory_items
SET location_code = CASE office_type
  WHEN 'OSDS' THEN '01' WHEN 'SGOD' THEN '02' WHEN 'CID' THEN '03'
  WHEN 'ES' THEN '04' WHEN 'HS' THEN '05' ELSE location_code END
WHERE location_code = '';

UPDATE public.inventory_items
SET school_code = CASE school_name
  WHEN 'Awihao Elementary School' THEN '02'
  WHEN 'Bato Elementary School' THEN '04'
  WHEN 'Fudencio Dolino Elementary School' THEN '19'
  WHEN 'Fulgencio Dolino Elementary School' THEN '19'
  WHEN 'Ibo Elementary School' THEN '22'
  WHEN 'Landahan Elementary School' THEN '24'
  WHEN 'Lower Tubod Elementary School' THEN '27'
  ELSE school_code
END
WHERE school_code = '' AND office_type IN ('ES', 'HS');
