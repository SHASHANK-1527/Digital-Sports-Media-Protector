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


def _run_detection_for_url(url: str) -> dict:
    detection_id = str(uuid.uuid4())
    tmp_path = None
    rep_frame = None

    try:
        tmp_path = fetch_from_url(url)
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
            return {"url": url, "error": "Could not process media"}

        query_phash = generate_phash(rep_frame)
        query_embedding = generate_embedding(rep_frame)

        match = find_best_match(query_phash, query_embedding)
        similarity = match["combined_similarity"] if match else 0.0

        matched_frames = 1 if match else 0
        if is_video and match and total_frames > 1:
            matched_frames = sum(
                1
                for f in frames[:10]
                if find_best_match(generate_phash(normalize_image(f)), generate_embedding(f))
            )
        coverage_ratio = matched_frames / max(total_frames, 1)

        verdict, confidence = compute_verdict(similarity, coverage_ratio)

        gemini_desc = None
        if match:
            gemini_desc = describe_content(rep_frame)

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
            "timestamp_match_start": None,
            "timestamp_match_end": None,
            "gemini_description": gemini_desc,
        }

        save_detection(result)
        return result
    except Exception as exc:
        return {"url": url, "error": str(exc)}
    finally:
        try:
            if tmp_path:
                os.remove(tmp_path)
            if rep_frame and rep_frame != tmp_path:
                os.remove(rep_frame)
        except Exception:
            pass


async def _run_detection_for_url_async(url: str) -> dict:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, _run_detection_for_url, url)


@router.post("/batch-detect")
async def batch_detect(request: BatchDetectRequest):
    urls = [url.strip() for url in request.urls if url and url.strip()]
    if not urls:
        raise HTTPException(status_code=400, detail="Provide between 1 and 10 URLs.")
    if len(urls) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 URLs are allowed.")

    tasks = [asyncio.create_task(_run_detection_for_url_async(url)) for url in urls]
    results = await asyncio.gather(*tasks)
    return results
