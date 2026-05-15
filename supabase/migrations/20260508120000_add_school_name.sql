ALTER TABLE teachers
ADD COLUMN IF NOT EXISTS school_name TEXT NOT NULL DEFAULT 'Landahan Elementary School';

ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS school_name TEXT NOT NULL DEFAULT 'Landahan Elementary School';

CREATE OR REPLACE VIEW inventory_listing AS
SELECT
  i.id,
  i.name,
  i.category,
  i.description,
  i.school_name,
  i.asset_tag,
  i.quantity,
  i.quantity_per_property_card,
  i.quantity_per_physical_count,
  i.usable_count,
  i.non_usable_count,
  i.unit_of_measurement,
  i.amount,
  i.uacs_code,
  i.fund_cluster_code,
  i.ics_number_source,
  i.ics_number_distribute,
  i.reference_number,
  i.asset_type,
  i.acquired_type,
  i.acquired_details,
  i.location,
  i.status,
  i.assigned_date,
  i.notes,
  t.id AS teacher_id,
  t.last_name,
  t.first_name,
  t.middle_name,
  t.suffix_name,
  t.department AS teacher_department,
  t.current_position AS teacher_position,
  t.email AS teacher_email
FROM inventory_items i
LEFT JOIN teachers t ON t.id = i.assigned_teacher_id;
