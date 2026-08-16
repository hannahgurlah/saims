#!/usr/bin/env python3
import csv
import sqlite3
import sys
import uuid
from pathlib import Path


def text(row, key):
    return (row.get(key) or "").strip()


def number(row, key, default=0):
    try:
        return float(text(row, key).replace(",", ""))
    except ValueError:
        return default


def integer(row, key, default=0):
    return int(number(row, key, default))


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: import-inventory-csv.py CSV_PATH SQLITE_DB_PATH")

    csv_path, db_path = map(Path, sys.argv[1:])
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    columns = {row[1] for row in connection.execute("PRAGMA table_info(inventory_items)")}
    existing = {
        (
            str(row["name"] or "").strip().lower(),
            str(row["school_name"] or "").strip().lower(),
            str(row["location"] or "").strip().lower(),
            int(row["quantity"] or 0),
            str(row["book_title"] or "").strip().lower(),
        )
        for row in connection.execute("SELECT name, school_name, location, quantity, book_title FROM inventory_items")
    }
    existing_tags = {row[0] for row in connection.execute("SELECT asset_tag FROM inventory_items")}
    teacher_ids = {}
    for teacher in connection.execute("SELECT id, first_name, middle_name, last_name, suffix_name FROM teachers"):
        parts = [teacher["first_name"], teacher["middle_name"], teacher["last_name"], teacher["suffix_name"]]
        teacher_ids[" ".join(filter(None, parts)).strip().lower()] = teacher["id"]

    inserted = duplicate = invalid = 0
    with csv_path.open(encoding="utf-8-sig", newline="") as source, connection:
        for row_number, row in enumerate(csv.DictReader(source), start=2):
            name = text(row, "Item Name")
            if not name:
                invalid += 1
                continue

            school = text(row, "School Name")
            location = text(row, "Location")
            quantity = max(1, integer(row, "Quantity", 1))
            book_title = text(row, "Book Title")
            key = (name.lower(), school.lower(), location.lower(), quantity, book_title.lower())
            if key in existing:
                duplicate += 1
                continue

            asset_tag = text(row, "Property Number") or f"IMP-20260816-{row_number:04d}"
            suffix = 1
            original_tag = asset_tag
            while asset_tag in existing_tags:
                suffix += 1
                asset_tag = f"{original_tag}-{suffix}"

            item_type = text(row, "Type of Item")
            asset_type = {
                "Semi-Expendable Property": "Semi-Expandable",
                "Property, Plant, and Equipment (PPE)": "PPE",
                "Consumables/Non Property Items": "Not Expandable",
            }.get(item_type, "PPE")
            acquired = text(row, "Acquired") or "Not Applicable"
            status_label = text(row, "Status") or "Available"
            status = "Retired" if status_label == "For Repair / Not Working" else status_label
            condition = {"Maintenance": "For Maintenance/Repair", "Retired": "Not Usable"}.get(status, "Working/Available")
            assigned_name = text(row, "Assigned Personnel").lower()
            teacher_id = teacher_ids.get(assigned_name)
            office_type = "ES" if "elementary school" in school.lower() else "HS" if "high school" in school.lower() else ""
            school_code = {"Landahan Elementary School": "23", "Ibo Elementary School": "21"}.get(school, "")

            record = {
                "id": str(uuid.uuid4()), "name": name, "item_form": text(row, "Item Type") or "Single",
                "bundle_items": text(row, "Items Included in Bundle/Package"), "category": text(row, "Category"),
                "subcategory": text(row, "Sub-Category"), "category_code": text(row, "Category Code"),
                "subcategory_code": text(row, "Sub-Category Code"), "description": text(row, "Description"),
                "date_received": text(row, "Date Received") or None, "brand_name": text(row, "Brand Name"),
                "model_number": text(row, "Model"), "serial_number": text(row, "Serial Number"),
                "book_title": book_title, "book_type": text(row, "Book Type").replace("Standard Textbooks", "Standard Textbook"),
                "grade_level": text(row, "Grade Level"), "subject_area": text(row, "Subject Area"),
                "book_author": text(row, "Book Author"), "book_publisher": text(row, "Book Publisher"),
                "school_name": school, "asset_tag": asset_tag, "quantity": quantity,
                "quantity_per_property_card": max(0, integer(row, "Quantity per Property Card")),
                "quantity_per_physical_count": max(0, integer(row, "Quantity per Physical Count")),
                "usable_count": max(0, integer(row, "No. of Usable")), "non_usable_count": max(0, integer(row, "No. of Non-usable")),
                "unit_of_measurement": text(row, "Unit of Measurement") or "Piece (PC)", "amount": max(0, number(row, "Price per Item")),
                "uacs_code": text(row, "UACS Code"), "fund_cluster_code": text(row, "Fund Cluster Code"),
                "ics_number_source": text(row, "ICS Number (Source)"), "ics_number_distribute": text(row, "ICS Number (Distribute)"),
                "reference_number": text(row, "Reference Number"), "asset_type": asset_type, "acquired_type": acquired,
                "acquisition_type": "Donation" if acquired == "Donated" else "Purchase" if acquired == "Purchase" else "Provision/Issuance",
                "acquired_details": text(row, "Acquired Details"), "property_condition": condition, "location": location,
                "status": status, "assigned_teacher_id": teacher_id, "assigned_date": text(row, "Date Assigned") or None,
                "notes": text(row, "Notes"), "office_type": office_type, "location_code": "04" if office_type == "ES" else "05" if office_type == "HS" else "",
                "school_code": school_code,
            }
            record = {key: value for key, value in record.items() if key in columns}
            names = ", ".join(record)
            placeholders = ", ".join("?" for _ in record)
            connection.execute(f"INSERT INTO inventory_items ({names}) VALUES ({placeholders})", tuple(record.values()))
            existing_tags.add(asset_tag)
            inserted += 1

    print(f"Inserted: {inserted}")
    print(f"Skipped existing duplicates: {duplicate}")
    print(f"Skipped invalid catalog-only rows: {invalid}")
    print(f"Inventory total: {connection.execute('SELECT COUNT(*) FROM inventory_items').fetchone()[0]}")


if __name__ == "__main__":
    main()
