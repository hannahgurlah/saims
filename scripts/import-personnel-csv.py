#!/usr/bin/env python3
import csv
import json
import os
import sys
import uuid
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen


CSV_COLUMNS = {
    "Last Name": "last_name",
    "First Name": "first_name",
    "Middle Name": "middle_name",
    "Suffix Name": "suffix_name",
    "School Name": "school_name",
    "Department": "department",
    "Current Position": "current_position",
    "Email": "email",
    "Date of Birth": "date_of_birth",
    "Date Hired in Toledo City Division": "date_hired_toledo",
    "Date Hired in Government": "date_hired_government",
    "GSIS Number": "gsis_number",
    "PhilHealth Number": "philhealth_number",
    "TIN Number": "tin_number",
    "Pag-IBIG Number": "pagibig_number",
    "SSS Number": "sss_number",
    "Civil Status": "civil_status",
    "Gender": "gender",
}

NULLABLE_COLUMNS = {"date_of_birth", "date_hired_toledo", "date_hired_government"}


def load_local_env(path):
    values = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        name, value = line.split("=", 1)
        values[name] = value.strip().strip("\"'")
    return values


def normalize(value):
    return " ".join(str(value or "").strip().lower().split())


def personnel_key(row):
    return tuple(
        normalize(row.get(column))
        for column in ("last_name", "first_name", "middle_name", "suffix_name", "school_name")
    )


def request_json(url, key, method="GET", payload=None, prefer=None):
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    request = Request(url, data=body, headers=headers, method=method)
    with urlopen(request, timeout=60) as response:
        content = response.read()
        return json.loads(content) if content else None


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: import-personnel-csv.py CSV_PATH SUPABASE_URL")

    csv_path = Path(sys.argv[1])
    supabase_url = sys.argv[2].rstrip("/")
    env = load_local_env(Path(__file__).resolve().parents[1] / ".env.local")
    service_key = env.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not service_key:
        raise SystemExit("SUPABASE_SERVICE_ROLE_KEY is missing from .env.local")

    with csv_path.open(encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source)
        missing_headers = [name for name in CSV_COLUMNS if name not in (reader.fieldnames or [])]
        if missing_headers:
            raise SystemExit(f"Missing CSV headers: {', '.join(missing_headers)}")
        csv_rows = list(reader)

    rows = []
    seen_csv_keys = set()
    for csv_row in csv_rows:
        row = {}
        for source_name, target_name in CSV_COLUMNS.items():
            value = (csv_row.get(source_name) or "").strip()
            row[target_name] = None if target_name in NULLABLE_COLUMNS and not value else value
        key = personnel_key(row)
        if key in seen_csv_keys:
            continue
        seen_csv_keys.add(key)
        row["id"] = str(uuid.uuid5(uuid.NAMESPACE_URL, "saims-personnel:" + "|".join(key)))
        rows.append(row)

    select = quote("last_name,first_name,middle_name,suffix_name,school_name", safe=",")
    existing = request_json(f"{supabase_url}/rest/v1/teachers?select={select}", service_key) or []
    existing_keys = {personnel_key(row) for row in existing}
    pending = [row for row in rows if personnel_key(row) not in existing_keys]

    for start in range(0, len(pending), 100):
        request_json(
            f"{supabase_url}/rest/v1/teachers?on_conflict=id",
            service_key,
            method="POST",
            payload=pending[start : start + 100],
            prefer="resolution=ignore-duplicates,return=minimal",
        )

    print(json.dumps({
        "csv_rows": len(csv_rows),
        "unique_csv_rows": len(rows),
        "existing_matches_skipped": len(rows) - len(pending),
        "inserted": len(pending),
    }))


if __name__ == "__main__":
    main()
