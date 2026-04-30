import asyncio
import os
import shutil
import uuid
from pathlib import Path
from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.ingest import fetch_from_url, normalize_image, extract_frames
from services.fingerprint import generate_phash
from services.embedding import generate_embedding
from services.matcher import find_best_match
from services.scorer import compute_verdict
from services.gemini import describe_content
from db.firestore import save_detection, increment_detection_count

router = APIRouter()

class BatchDetectRequest(BaseModel):
    urls: List[str] = Field(..., max_items=10)


# Max 1 concurrent heavy task for Free Tiers (512MB RAM limit)
MAX_CONCURRENT_TASKS = 1
semaphore = asyncio.Semaphore(MAX_CONCURRENT_TASKS)

def _run_detection_for_url(url: str) -> dict:
    detection_id = str(uuid.uuid4())
    tmp_path = None
    rep_frame = None

    try:
        # Step 1: Ingest
        tmp_path = fetch_from_url(url)
        is_video = tmp_path.suffix.lower() in [".mp4", ".mov", ".webm", ".avi"]

        # Step 2: Extract & Normalize
        if is_video:
            frames = extract_frames(tmp_path)
            if not frames:
                return {"url": url, "error": "No frames could be extracted from video", "status": "failed"}
            rep_frame = normalize_image(frames[0])
            total_frames = len(frames)
        else:
            rep_frame = normalize_image(tmp_path)
            frames = [rep_frame]
            total_frames = 1

        if not rep_frame:
            return {"url": url, "error": "Normalization failed", "status": "failed"}

        # Step 3: Fingerprinting
        query_phash = generate_phash(rep_frame)
        query_embedding = generate_embedding(rep_frame)

        # Step 4: Matching
        match = find_best_match(query_phash, query_embedding)
        similarity = match["combined_similarity"] if match else 0.0

        # Step 5: Coverage (Video Only)
        matched_frames = 1 if match else 0
        if is_video and match and total_frames > 1:
            # Check up to 10 frames for coverage calculation
            check_frames = frames[:10]
            for f in check_frames:
                f_norm = normalize_image(f)
                if find_best_match(generate_phash(f_norm), generate_embedding(f_norm)):
                    matched_frames += 1
                if f_norm != f:
                    os.remove(f_norm)
        
        coverage_ratio = matched_frames / max(total_frames, 1)

        # Step 6: Scoring & Verdict
        verdict, confidence = compute_verdict(similarity, coverage_ratio)

        # Step 7: AI Analysis (Gemini) - Only for significant matches to save tokens/time
        gemini_desc = None
        if match and verdict in ["Pirated", "Suspicious"]:
            gemini_desc = describe_content(rep_frame)

        # Step 8: Update Stats
        if match and verdict in ["Pirated", "Suspicious"]:
            increment_detection_count(match["content_id"])

        result = {
            "url": url,
            "detection_id": detection_id,
            "verdict": verdict,
            "confidence_score": confidence,
            "similarity_score": similarity,
            "coverage_ratio": coverage_ratio,
            "matched_content_id": match["content_id"] if match else None,
            "matched_owner": match["owner_name"] if match else None,
            "matched_file_url": match.get("file_url") if match else None,
            "gemini_description": gemini_desc,
            "status": "success"
        }

        save_detection(result)
        return result

    except Exception as exc:
        import traceback
        print(f"Batch Error for {url}: {str(exc)}")
        print(traceback.format_exc())
        return {"url": url, "error": str(exc), "status": "failed"}
    finally:
        # Cleanup
        try:
            if tmp_path and os.path.exists(tmp_path):
                os.remove(tmp_path)
            if rep_frame and rep_frame != tmp_path and os.path.exists(rep_frame):
                os.remove(rep_frame)
            # Cleanup extracted frames if they exist
            if 'frames' in locals():
                for f in frames:
                    if os.path.exists(f) and f != tmp_path:
                        os.remove(f)
        except Exception:
            pass


async def _run_detection_for_url_async(url: str) -> dict:
    async with semaphore:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, _run_detection_for_url, url)


@router.post("/batch-detect")
async def batch_detect(request: BatchDetectRequest):
    urls = [url.strip() for url in request.urls if url and url.strip()]
    if not urls:
        raise HTTPException(status_code=400, detail="Provide between 1 and 10 URLs.")
    
    # Process tasks with limited concurrency
    results = await asyncio.gather(*[_run_detection_for_url_async(url) for url in urls])
    return results
