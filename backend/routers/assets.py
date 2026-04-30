from db.firestore import get_db

router = APIRouter()

@router.get("/assets")
async def list_assets(authorization: str = Header(...)):
  # ... (auth logic)
  db = get_db()
  if db is None:
      from services.matcher import get_local_assets
      return {"assets": get_local_assets()}

  assets = [doc.to_dict() for doc in db.collection("official_media").stream()]
  return {"assets": assets}

@router.get("/detections")
async def list_detections():
  db = get_db()
  if db is None:
      return {"detections": []}
  detections = [doc.to_dict() for doc in db.collection("detections").stream()]
  return {"detections": detections}
