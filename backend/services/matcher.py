import json
from pathlib import Path

# Try to import Supabase service
try:
    from db import supabase_db
    USE_SUPABASE = os.environ.get("SUPABASE_URL") is not None
except ImportError:
    USE_SUPABASE = False

def get_local_assets():
    path = Path("local_registry.json")
    if path.exists():
        with open(path, "r") as f:
            return json.load(f)
    return []

from services.fingerprint import phash_similarity
from services.embedding import cosine_similarity

PHASH_THRESHOLD = 12       # Hamming distance — candidates below this advance
PHASH_WEIGHT = 0.4
CNN_WEIGHT = 0.6


def find_best_match(query_phash: str, query_embedding: list[float]) -> dict | None:
  """
  Query for all registered assets.
  Return the best matching asset dict or None if no match above threshold.
  """
  if USE_SUPABASE:
      # High-performance Vector Search
      candidates = supabase_db.vector_search_assets(query_embedding, limit=50)
      # In Supabase, the SQL function already returns 'similarity' (cosine)
      # But we still want to verify with pHash for robustness
      best_asset, best_score = None, -1.0
      for asset in candidates:
          p_sim = phash_similarity(query_phash, asset["phash"])
          c_sim = asset["similarity"]
          combined = PHASH_WEIGHT * p_sim + CNN_WEIGHT * c_sim
          if combined > best_score:
              best_score = combined
              best_asset = {**asset, "combined_similarity": combined}
      
      return best_asset if best_score > 0.4 else None

  else:
      # Fallback: Local Registry or Firestore
      assets = get_local_assets()
      if not assets:
          try:
              from db import firestore
              assets = firestore.get_all_official_media()
          except Exception:
              assets = []
      
      candidates = []

      for asset in assets:
        p_sim = phash_similarity(query_phash, asset["phash"])
        hamming = int((1 - p_sim) * 64)
        if hamming <= PHASH_THRESHOLD:
          candidates.append((asset, p_sim))

      if not candidates:
        return None

      best_asset, best_score = None, -1.0
      for asset, p_sim in candidates:
        c_sim = cosine_similarity(query_embedding, asset["embedding"])
        combined = PHASH_WEIGHT * p_sim + CNN_WEIGHT * c_sim
        if combined > best_score:
          best_score = combined
          best_asset = {**asset, "combined_similarity": combined}

      return best_asset if best_score > 0.4 else None
