import firebase_admin
from firebase_admin import credentials, firestore
import os

cred = credentials.Certificate(os.environ["FIREBASE_SERVICE_ACCOUNT_PATH"])
firebase_admin.initialize_app(cred)
db = firestore.client()

def save_official_media(data: dict):
  db.collection("official_media").document(data["content_id"]).set(data)


def get_all_official_media() -> list[dict]:
  return [d.to_dict() for d in db.collection("official_media").stream()]


def save_detection(data: dict):
  db.collection("detections").document(data["detection_id"]).set(data)


def get_detection(detection_id: str) -> dict | None:
  doc = db.collection("detections").document(detection_id).get()
  return doc.to_dict() if doc.exists else None


def increment_detection_count(content_id: str):
  ref = db.collection("official_media").document(content_id)
  ref.update({"detection_count": firestore.Increment(1)})
