import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()
url = os.getenv('CLOUDINARY_URL')
print(f"DEBUG: CLOUDINARY_URL exists: {bool(url)}")

cloudinary.config(from_url=url)

try:
    result = cloudinary.uploader.upload(
        r'c:\Users\Asus\Desktop\ecom-dashboard\apps\static\images\placeholder.png', 
        folder='chasma-gallery'
    )
    print(f"SUCCESS: {result['secure_url']}")
except Exception as e:
    print(f"ERROR: {e}")
