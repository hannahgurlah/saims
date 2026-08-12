ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS item_form TEXT NOT NULL DEFAULT 'Single'
    CHECK (item_form IN ('Single', 'Bundle/Package')),
  ADD COLUMN IF NOT EXISTS bundle_items TEXT NOT NULL DEFAULT '';

CREATE OR REPLACE VIEW inventory_listing AS
SELECT
  i.id,
  i.name,
  i.category,
  i.description,
  i.date_received,
  i.brand_name,
  i.book_title,
  i.book_publisher,
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
  t.email AS teacher_email,
  i.item_form,
  i.bundle_items
FROM inventory_items i
LEFT JOIN teachers t ON t.id = i.assigned_teacher_id;
