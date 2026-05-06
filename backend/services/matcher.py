from db.firestore import get_all_official_media
from services.fingerprint import phash_similarity
from services.embedding import cosine_similarity

PHASH_THRESHOLD = 25       # Hamming distance — candidates below this advance
PHASH_WEIGHT = 0.4
CNN_WEIGHT = 0.6


def find_best_match(query_phash: str, query_embedding: list[float]) -> dict | None:
  """
  Query Firestore for all registered assets.
  Return the best matching asset dict or None if no match above threshold.
  """
  assets = get_all_official_media()   # returns list of Firestore docs as dicts
  candidates = []

  for asset in assets:
    p_sim = phash_similarity(query_phash, asset["phash"])
    hamming = int((1 - p_sim) * 64)
    if hamming <= PHASH_THRESHOLD:
      candidates.append((asset, p_sim))

  print(f"Query phash: {query_phash}")
  print(f"Candidates found: {len(candidates)}")
  for asset, p_sim in candidates:
    print(f"  Match: {asset['content_id'][:8]} sim={p_sim:.3f}")

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
