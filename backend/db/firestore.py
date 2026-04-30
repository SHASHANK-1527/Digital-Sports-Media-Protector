import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

# Global DB reference
db = None

def get_db():
    global db
    if db is not None:
        return db
    
    # Try to initialize only if keys are present
    try:
        cred_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
        if cred_json:
            cred_dict = json.loads(cred_json)
            cred = credentials.Certificate(cred_dict)
            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred)
            db = firestore.client()
            return db
    except Exception as e:
        print(f"!!! DATABASE OFFLINE: {e}")
    
    return None

def save_official_media(data: dict):
    _db = get_db()
    if _db is None: return False
    try:
        _db.collection("official_media").document(data["content_id"]).set(data)
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

def get_all_official_media() -> list[dict]:
    _db = get_db()
    if _db is None: return []
    try:
        return [d.to_dict() for d in _db.collection("official_media").stream()]
    except Exception as e:
        print(f"Error: {e}")
        return []

def save_detection(detection_id_or_data, data=None):
    _db = get_db()
    if _db is None: return False
    try:
        if data is None:
            det_id = detection_id_or_data.get("detection_id")
            _db.collection("detections").document(det_id).set(detection_id_or_data)
        else:
            _db.collection("detections").document(detection_id_or_data).set(data)
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

def increment_detection_count(content_id: str):
    _db = get_db()
    if _db is None: return False
    try:
        ref = _db.collection("official_media").document(content_id)
        ref.update({"detection_count": firestore.Increment(1)})
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

def get_detection(detection_id: str):
    _db = get_db()
    if _db is None: return None
    try:
        doc = _db.collection("detections").document(detection_id).get()
        return doc.to_dict() if doc.exists else None
    except Exception as e:
        print(f"Error: {e}")
        return None
