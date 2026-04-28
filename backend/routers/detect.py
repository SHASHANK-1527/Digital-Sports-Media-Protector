from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional
from services.ingest import fetch_from_url, normalize_image, extract_frames
from services.fingerprint import generate_phash
from services.embedding import generate_embedding
from services.matcher import find_best_match
from services.scorer import compute_verdict
from services.gemini import describe_content
from services.report import generate_evidence_report
from db.firestore import save_detection, increment_detection_count
from pathlib import Path
import uuid, shutil, os

router = APIRouter()

@router.post("/detect")
async def detect_media(
  file: Optional[UploadFile] = File(None),
  url: Optional[str] = Form(None)
):
  detection_id = str(uuid.uuid4())
  tmp_path = None
  rep_frame = None

  try:
    if file:
      tmp_path = Path(f"/tmp/dap/{detection_id}_{file.filename}")
      with open(tmp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    elif url:
      tmp_path = fetch_from_url(url)
    else:
      return {"error": "Provide a file or URL"}

    is_video = tmp_path.suffix.lower() in [".mp4", ".mov", ".webm", ".avi"]

    if is_video:
      frames = extract_frames(tmp_path)
      rep_frame = normalize_image(frames[0]) if frames else None
      total_frames = len(frames)
    else:
      rep_frame = normalize_image(tmp_path)
      frames = [rep_frame]
      total_frames = 1

    if not rep_frame:
      return {"error": "Could not process media"}

    query_phash = generate_phash(rep_frame)
    query_embedding = generate_embedding(rep_frame)

    match = find_best_match(query_phash, query_embedding)

    similarity = match["combined_similarity"] if match else 0.0

    # Coverage ratio: for video, check how many frames match (cap at 10 frames)
    matched_frames = 1 if match else 0
    if is_video and match and total_frames > 1:
      matched_frames = sum(
        1 for f in frames[:10]
        if find_best_match(generate_phash(normalize_image(f)), generate_embedding(f))
      )
    coverage_ratio = matched_frames / max(total_frames, 1)

    verdict, confidence = compute_verdict(similarity, coverage_ratio)

    # Gemini description (only if match found)
    gemini_desc = None
    if match:
      gemini_desc = describe_content(rep_frame)

    # Forensic Watermark Extraction
    from services.watermark import extract_watermark
    watermark_found = extract_watermark(rep_frame)

    # Increment detection count on matched asset
    if match and verdict in ["Pirated", "Suspicious"]:
      increment_detection_count(match["content_id"])

    result = {
      "detection_id": detection_id,
      "verdict": verdict,
      "confidence_score": confidence,
      "similarity_score": similarity,
      "coverage_ratio": coverage_ratio,
      "matched_content_id": match["content_id"] if match else None,
      "matched_owner": match["owner_name"] if match else None,
      "matched_file_url": match.get("file_url") if match else None,
      "watermark_verified": watermark_found is not None,
      "watermark_payload": watermark_found,
      "timestamp_match_start": None,
      "timestamp_match_end": None,
      "gemini_description": gemini_desc,
    }

    save_detection(result)
    return result

  except Exception as e:
    import traceback
    print(f"CRITICAL ERROR in /detect: {str(e)}")
    print(traceback.format_exc())
    return {"error": f"Internal Server Error: {str(e)}"}

  finally:
    try:
      if tmp_path:
        os.remove(tmp_path)
      if rep_frame and rep_frame != tmp_path:
        os.remove(rep_frame)
    except Exception:
      pass


@router.get("/detections/{detection_id}/report")
async def download_report(detection_id: str):
  from fastapi.responses import FileResponse
  from db.firestore import get_detection
  detection = get_detection(detection_id)
  if not detection:
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Detection not found")
  out_path = Path(f"/tmp/dap/report_{detection_id}.pdf")
  generate_evidence_report(detection, out_path)
  return FileResponse(out_path, media_type="application/pdf",
                      filename=f"evidence_{detection_id}.pdf")
