"""
One-time migration: create Contacts subcategories.
Run from the apps/ directory:
    python create_contacts_categories.py
"""
import uuid
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
import db

def run():
    # ── Find parent: Contacts ──────────────────────────────────────────────────
    contacts = db.query_one("SELECT id FROM categories WHERE slug = 'contacts'")
    if not contacts:
        print("ERROR: 'contacts' root category not found. Create it first in the admin.")
        return
    contacts_id = contacts["id"]

    # ── Level-1 subcategories under Contacts ──────────────────────────────────
    level1 = [
        {"name": "Color Contact Lens", "slug": "color-contact-lens"},
        {"name": "Clear Contact Lens",  "slug": "clear-contact-lens"},
    ]

    l1_ids = {}
    for cat in level1:
        existing = db.query_one("SELECT id FROM categories WHERE slug = %s", [cat["slug"]])
        if existing:
            l1_ids[cat["slug"]] = existing["id"]
            print(f"  already exists: {cat['name']}")
        else:
            new_id = str(uuid.uuid4())
            db.execute(
                "INSERT INTO categories (id, name, slug, parent_id, is_featured) VALUES (%s,%s,%s,%s,%s)",
                [new_id, cat["name"], cat["slug"], contacts_id, False],
            )
            l1_ids[cat["slug"]] = new_id
            print(f"  created: {cat['name']}")

    # ── Level-2 subcategories under Color Contact Lens ────────────────────────
    color_id = l1_ids["color-contact-lens"]
    color_subs = [
        {"name": "Zero Power",  "slug": "color-lens-zero-power"},
        {"name": "With Power",  "slug": "color-lens-with-power"},
    ]
    for cat in color_subs:
        existing = db.query_one("SELECT id FROM categories WHERE slug = %s", [cat["slug"]])
        if existing:
            print(f"    already exists: {cat['name']}")
        else:
            db.execute(
                "INSERT INTO categories (id, name, slug, parent_id, is_featured) VALUES (%s,%s,%s,%s,%s)",
                [str(uuid.uuid4()), cat["name"], cat["slug"], color_id, False],
            )
            print(f"    created: {cat['name']}")

    # ── Level-2 subcategories under Clear Contact Lens ────────────────────────
    clear_id = l1_ids["clear-contact-lens"]
    clear_subs = [
        {"name": "Distance Power (-ve)",    "slug": "clear-lens-distance-power"},
        {"name": "Toric / Cylindrical",     "slug": "clear-lens-toric-cylindrical"},
        {"name": "Multi-Focal",             "slug": "clear-lens-multifocal"},
        {"name": "All Powers",              "slug": "clear-lens-all-powers"},
    ]
    for cat in clear_subs:
        existing = db.query_one("SELECT id FROM categories WHERE slug = %s", [cat["slug"]])
        if existing:
            print(f"    already exists: {cat['name']}")
        else:
            db.execute(
                "INSERT INTO categories (id, name, slug, parent_id, is_featured) VALUES (%s,%s,%s,%s,%s)",
                [str(uuid.uuid4()), cat["name"], cat["slug"], clear_id, False],
            )
            print(f"    created: {cat['name']}")

    print("\nDone. Restart the Flask app to clear query caches.")

if __name__ == "__main__":
    run()
