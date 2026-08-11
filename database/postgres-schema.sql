CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  middle_name TEXT NOT NULL DEFAULT '',
  suffix_name TEXT NOT NULL DEFAULT '',
  school_name TEXT NOT NULL DEFAULT 'Landahan Elementary School',
  department TEXT NOT NULL,
  current_position TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  date_of_birth TEXT,
  date_hired_toledo TEXT,
  date_hired_government TEXT,
  gsis_number TEXT NOT NULL DEFAULT '',
  philhealth_number TEXT NOT NULL DEFAULT '',
  tin_number TEXT NOT NULL DEFAULT '',
  pagibig_number TEXT NOT NULL DEFAULT '',
  sss_number TEXT NOT NULL DEFAULT '',
  civil_status TEXT NOT NULL CHECK (civil_status IN ('Single', 'Married', 'Widowed', 'Separated')),
  gender TEXT NOT NULL CHECK (gender IN ('Female', 'Male', 'Prefer not to say')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  date_received TEXT,
  brand_name TEXT NOT NULL DEFAULT '',
  book_title TEXT NOT NULL DEFAULT '',
  book_publisher TEXT NOT NULL DEFAULT '',
  school_name TEXT NOT NULL DEFAULT 'Landahan Elementary School',
  asset_tag TEXT NOT NULL UNIQUE,
  quantity INTEGER NOT NULL CHECK (quantity >= 1),
  quantity_per_property_card INTEGER NOT NULL DEFAULT 0 CHECK (quantity_per_property_card >= 0),
  quantity_per_physical_count INTEGER NOT NULL DEFAULT 0 CHECK (quantity_per_physical_count >= 0),
  usable_count INTEGER NOT NULL DEFAULT 0 CHECK (usable_count >= 0),
  non_usable_count INTEGER NOT NULL DEFAULT 0 CHECK (non_usable_count >= 0),
  unit_of_measurement TEXT NOT NULL DEFAULT 'piece',
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  uacs_code TEXT NOT NULL,
  fund_cluster_code TEXT NOT NULL,
  ics_number_source TEXT NOT NULL DEFAULT '',
  ics_number_distribute TEXT NOT NULL DEFAULT '',
  reference_number TEXT NOT NULL DEFAULT '',
  asset_type TEXT NOT NULL CHECK (asset_type IN ('PPE', 'Semi-Expandable', 'Not Expandable')),
  acquired_type TEXT NOT NULL DEFAULT 'Not Applicable' CHECK (acquired_type IN ('Purchase', 'Donated', 'Not Applicable')),
  acquired_details TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Available', 'Assigned', 'Maintenance', 'Retired')),
  assigned_teacher_id TEXT REFERENCES teachers(id) ON DELETE SET NULL,
  assigned_date TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id TEXT PRIMARY KEY,
  inventory_item_id TEXT NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out')),
  quantity INTEGER NOT NULL CHECK (quantity >= 1),
  movement_date TEXT NOT NULL,
  personnel_name TEXT NOT NULL DEFAULT '',
  remarks TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager')),
  school_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_assigned_teacher_id ON inventory_items (assigned_teacher_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_updated_at ON inventory_items (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_inventory_item_id ON stock_movements (inventory_item_id);

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
  t.email AS teacher_email
FROM inventory_items i
LEFT JOIN teachers t ON t.id = i.assigned_teacher_id;
