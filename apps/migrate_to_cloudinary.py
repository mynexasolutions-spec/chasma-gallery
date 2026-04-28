import os
import db
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()
url = os.getenv('CLOUDINARY_URL')
parts = url.replace('cloudinary://', '').split('@')
creds = parts[0].split(':')
cloudinary.config(
    cloud_name=parts[1],
    api_key=creds[0],
    api_secret=creds[1],
    secure=True
)

def upload_file(full_path, folder='chasma-gallery'):
    try:
        res = cloudinary.uploader.upload(full_path, folder=folder)
        return res['secure_url']
    except Exception as e:
        print(f"Failed to upload {full_path}: {e}")
        return None

def migrate_static_assets():
    static_dirs = [
        os.path.join('static', 'images', 'hero'),
        os.path.join('static', 'images', 'sections'),
        os.path.join('static', 'images', 'about'),
    ]
    mapping = {}
    for d in static_dirs:
        full_dir = os.path.join(os.getcwd(), d)
        if not os.path.exists(full_dir): continue
        for f in os.listdir(full_dir):
            if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp')):
                rel_path = os.path.join(d, f).replace('\\', '/')
                # path relative to static/images
                key = rel_path.replace('static/images/', '')
                print(f"Uploading static asset: {rel_path}...")
                url = upload_file(os.path.join(full_dir, f), folder=f"chasma-gallery/{d.replace('static/', '')}")
                if url:
                    mapping[key] = url
    
    # Also upload root images
    root_images = os.path.join('static', 'images')
    for f in os.listdir(root_images):
        full_path = os.path.join(root_images, f)
        if os.path.isfile(full_path) and f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp')):
            print(f"Uploading root static asset: {f}...")
            url = upload_file(full_path, folder="chasma-gallery/static")
            if url:
                mapping[f] = url
                
    return mapping

def migrate_table(table, column):
    rows = db.query(f"SELECT id, {column} FROM {table} WHERE {column} IS NOT NULL AND {column} NOT LIKE 'http%%'")
    print(f"Found {len(rows)} local images in {table}.{column}")
    for r in rows:
        val = r[column]
        local_path = None
        if val.startswith('/uploads/'):
            local_path = os.path.join('static', val.lstrip('/'))
        else:
            local_path = os.path.join('static', 'images', val.lstrip('/'))
            
        full_path = os.path.join(os.getcwd(), local_path)
        if not os.path.exists(full_path):
             # Try without 'images' folder
             local_path = os.path.join('static', val.lstrip('/'))
             full_path = os.path.join(os.getcwd(), local_path)
             
        if os.path.exists(full_path):
            print(f"Uploading DB asset {val}...")
            url = upload_file(full_path)
            if url:
                db.execute(f"UPDATE {table} SET {column} = %s WHERE id = %s", [url, r['id']])
        else:
            print(f"File not found for {table}.{column}: {val}")

if __name__ == "__main__":
    migrate_table('categories', 'image_url')
    migrate_table('brands', 'image_url')
    migrate_table('attributes', 'image_url')
    migrate_table('attribute_values', 'image_url')
    migrate_table('media', 'file_url')
    
    print("\n--- MIGRATING STATIC ASSETS ---")
    static_mapping = migrate_static_assets()
    print("\nSTATIC ASSET MAPPING (Use these in templates or update resolve_image):")
    for k, v in static_mapping.items():
        print(f"'{k}': '{v}',")
    
    print("\nMigration complete!")
