import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

if not firebase_admin._apps:
    # Priority 1: fresh JSON file
    sa_path = Path(__file__).parent.parent / "firebase-service-account-fresh.json"
    
    # Priority 2: env var JSON string
    sa_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON", "").strip()
    
    # Priority 3: env var file path
    sa_env_path = os.environ.get("FIREBASE_SERVICE_ACCOUNT_PATH", "").strip()
    
    if sa_path.exists():
        print(f"Loading Firebase from file: {sa_path}")
        cred = credentials.Certificate(str(sa_path))
        firebase_admin.initialize_app(cred)
    elif sa_json:
        print("Loading Firebase from JSON env var")
        cred = credentials.Certificate(json.loads(sa_json))
        firebase_admin.initialize_app(cred)
    elif sa_env_path and Path(sa_env_path).exists():
        print(f"Loading Firebase from path env var: {sa_env_path}")
        cred = credentials.Certificate(sa_env_path)
        firebase_admin.initialize_app(cred)
    else:
        raise RuntimeError(
            "No Firebase credentials found. "
            "Add firebase-service-account-fresh.json to backend/ folder "
            "or set FIREBASE_SERVICE_ACCOUNT_JSON env var."
        )

try:
    db = firestore.client()
    print("Firestore connected successfully")
except Exception as e:
    print(f"Firestore connection failed: {e}")
    db = None


def save_official_media(data: dict):
    try:
        if db is None:
            print(f"Warning: Firestore client not initialized")
            return False
        db.collection("official_media").document(data["content_id"]).set(data)
        return True
    except Exception as e:
        print(f"Error saving official media: {e}")
        return False

def get_all_official_media() -> list[dict]:
    try:
        if db is None:
            print(f"Warning: Firestore client not initialized")
            return []
        return [d.to_dict() for d in db.collection("official_media").stream()]
    except Exception as e:
        print(f"Error fetching all media: {e}")
        return []

def save_detection(detection_id_or_data, data=None):
    try:
        if db is None:
            print(f"Warning: Firestore client not initialized")
            return False
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
        if db is None:
            print(f"Warning: Firestore client not initialized")
            return False
        ref = db.collection("official_media").document(content_id)
        ref.update({"detection_count": firestore.Increment(1)})
        return True
    except Exception as e:
        print(f"Error incrementing detection count: {e}")
        return False

def get_detection(detection_id: str):
    try:
        if db is None:
            print(f"Warning: Firestore client not initialized")
            return None
        doc = db.collection("detections").document(detection_id).get()
        return doc.to_dict() if doc.exists else None
    except Exception as e:
        print(f"Error fetching detection: {e}")
        return None
