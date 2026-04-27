from fastapi import APIRouter, Header, HTTPException
from firebase_admin import auth as fb_auth
from db.firestore import db

router = APIRouter()

@router.get("/assets")
async def list_assets(authorization: str = Header(...)):
  id_token = authorization.replace("Bearer ", "")
  try:
    decoded = fb_auth.verify_id_token(id_token)
  except Exception:
    raise HTTPException(status_code=401, detail="Invalid auth token")

  owner_name = decoded.get("name") or decoded.get("email")
  if not owner_name:
    raise HTTPException(status_code=401, detail="Invalid auth token")

  assets = [doc.to_dict() for doc in db.collection("official_media").where("owner_name", "==", owner_name).stream()]
  return {"assets": assets}

@router.get("/detections")
async def list_detections():
  detections = [doc.to_dict() for doc in db.collection("detections").stream()]
  return {"detections": detections}
