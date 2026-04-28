import os
import db
import json
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
        ('hero', os.path.join('static', 'images', 'hero')),
        ('sections', os.path.join('static', 'images', 'sections')),
        ('about', os.path.join('static', 'images', 'about')),
        ('static', os.path.join('static', 'images')),
    ]
    mapping = {}
    for folder_name, d in static_dirs:
        full_dir = os.path.join(os.getcwd(), d)
        if not os.path.exists(full_dir): continue
        for f in os.listdir(full_dir):
            full_path = os.path.join(full_dir, f)
            if os.path.isfile(full_path) and f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp')):
                key = f if folder_name == 'static' else f"{folder_name}/{f}"
                if key in mapping: continue # Already uploaded
                print(f"Uploading: {key}...")
                url = upload_file(full_path, folder=f"chasma-gallery/{folder_name}")
                if url:
                    mapping[key] = url
                
    return mapping

if __name__ == "__main__":
    mapping = migrate_static_assets()
    with open('cloudinary_mapping.json', 'w') as f:
        json.dump(mapping, f, indent=2)
    print("Static migration complete. Mapping saved to cloudinary_mapping.json")
