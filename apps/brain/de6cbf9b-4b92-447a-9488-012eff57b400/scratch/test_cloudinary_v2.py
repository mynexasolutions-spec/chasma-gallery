import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()
url = os.getenv('CLOUDINARY_URL')
print(f"DEBUG: URL={url}")

# Manual parse if from_url fails
parts = url.replace('cloudinary://', '').split('@')
creds = parts[0].split(':')
cloud_name = parts[1]
api_key = creds[0]
api_secret = creds[1]

print(f"DEBUG: cloud_name={cloud_name}, api_key={api_key}")

cloudinary.config(
  cloud_name = cloud_name,
  api_key = api_key,
  api_secret = api_secret,
  secure = True
)

try:
    result = cloudinary.uploader.upload(
        r'c:\Users\Asus\Desktop\ecom-dashboard\apps\static\images\placeholder.png', 
        folder='chasma-gallery'
    )
    print(f"SUCCESS: {result['secure_url']}")
except Exception as e:
    print(f"ERROR: {e}")
