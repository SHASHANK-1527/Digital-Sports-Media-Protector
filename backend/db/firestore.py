import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin
cred_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
if cred_json:
    cred_dict = json.loads(cred_json)
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)
else:
    # Local development fallback
    firebase_admin.initialize_app()

# Use the standard (default) database client
db = firestore.client()

def save_official_media(data: dict):
    try:
        db.collection("official_media").document(data["content_id"]).set(data)
        return True
    except Exception as e:
        print(f"Error saving to Firestore: {e}")
        return False

def get_all_official_media() -> list[dict]:
    return [d.to_dict() for d in db.collection("official_media").stream()]
