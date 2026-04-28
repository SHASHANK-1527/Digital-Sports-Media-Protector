import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin
cred_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
if cred_json:
    cred_dict = json.loads(cred_json)
    cred = credentials.Certificate(cred_dict)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
else:
    if not firebase_admin._apps:
        firebase_admin.initialize_app()

# Use the standard (default) database client
db = firestore.client()

def save_official_media(data: dict):
    try:
        db.collection("official_media").document(data["content_id"]).set(data)
        return True
    except Exception as e:
        print(f"Error saving official media: {e}")
        return False

def get_all_official_media() -> list[dict]:
    try:
        return [d.to_dict() for d in db.collection("official_media").stream()]
    except Exception as e:
        print(f"Error fetching all media: {e}")
        return []

def save_detection(detection_id_or_data, data=None):
    try:
        if data is None:
            # Case for batch detection where only data dict is passed
            det_id = detection_id_or_data.get("detection_id")
            if not det_id:
                import uuid
                det_id = str(uuid.uuid4())
            db.collection("detections").document(det_id).set(detection_id_or_data)
        else:
            # Case for single detection where id and data are separate
            db.collection("detections").document(detection_id_or_data).set(data)
        return True
    except Exception as e:
        print(f"Error saving detection: {e}")
        return False

def increment_detection_count(content_id: str):
    try:
        ref = db.collection("official_media").document(content_id)
        ref.update({"detection_count": firestore.Increment(1)})
        return True
    except Exception as e:
        print(f"Error incrementing detection count: {e}")
        return False

def get_detection(detection_id: str):
    try:
        doc = db.collection("detections").document(detection_id).get()
        return doc.to_dict() if doc.exists else None
    except Exception as e:
        print(f"Error fetching detection: {e}")
        return None
