import json
import os

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore import Increment

if not firebase_admin._apps:
    service_account_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON", "")
    service_account_path = os.environ.get("FIREBASE_SERVICE_ACCOUNT_PATH", "")

    if service_account_json and service_account_json.strip():
        service_account_info = json.loads(service_account_json.strip())
        cred = credentials.Certificate(service_account_info)
    elif service_account_path and os.path.exists(service_account_path):
        cred = credentials.Certificate(service_account_path)
    else:
        raise ValueError(
            "Neither FIREBASE_SERVICE_ACCOUNT_JSON nor "
            "FIREBASE_SERVICE_ACCOUNT_PATH is set correctly"
        )
    print(f"DEBUG: Firebase Initializing with project_id: {getattr(cred, 'project_id', 'unknown')}")
    firebase_admin.initialize_app(cred)

db = firestore.client()
print(f"DEBUG: Firestore client initialized for project: {db.project}")

def save_official_media(data: dict):
    try:
        print(f"DEBUG: Attempting to save asset {data['content_id']} to collection 'official_media'")
        db.collection("official_media").document(data["content_id"]).set(data)
        print(f"DEBUG: Asset {data['content_id']} saved successfully")
    except Exception as e:
        print(f"ERROR: Failed to save to Firestore: {str(e)}")
        raise e


def get_all_official_media() -> list[dict]:
  return [d.to_dict() for d in db.collection("official_media").stream()]


def save_detection(data: dict):
  db.collection("detections").document(data["detection_id"]).set(data)


def get_detection(detection_id: str) -> dict | None:
  doc = db.collection("detections").document(detection_id).get()
  return doc.to_dict() if doc.exists else None


def increment_detection_count(content_id: str):
  ref = db.collection("official_media").document(content_id)
  ref.update({"detection_count": Increment(1)})
