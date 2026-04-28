import yt_dlp, requests, cv2, uuid, os
from pathlib import Path

TEMP_DIR = Path("/tmp/dap")
TEMP_DIR.mkdir(exist_ok=True)


def fetch_from_url(url: str) -> Path:
  """Download media from URL. Returns local file path."""
  dest = TEMP_DIR / f"{uuid.uuid4()}"
  if "youtube.com" in url or "youtu.be" in url:
    ydl_opts = {'outtmpl': str(dest) + '.%(ext)s', 'format': 'mp4'}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
      ydl.download([url])
    return next(TEMP_DIR.glob(f"{dest.name}.*"))
  else:
    r = requests.get(url, timeout=30)
    suffix = ".mp4" if "video" in r.headers.get("content-type","") else ".jpg"
    p = Path(str(dest) + suffix)
    p.write_bytes(r.content)
    return p


def extract_frames(video_path: Path, max_frames: int = 10) -> list[Path]:
  """Extract up to max_frames from a video using seeking to save RAM."""
  cap = cv2.VideoCapture(str(video_path))
  total_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
  if total_count <= 0:
    cap.release()
    return []
  
  # Calculate interval to get max_frames evenly spread
  interval = max(1, total_count // max_frames)
  frame_paths = []
  
  for i in range(0, total_count, interval):
    if len(frame_paths) >= max_frames:
      break
    cap.set(cv2.CAP_PROP_POS_FRAMES, i)
    ret, frame = cap.read()
    if not ret:
      break
    
    p = TEMP_DIR / f"{video_path.stem}_f{i}.jpg"
    cv2.imwrite(str(p), frame)
    frame_paths.append(p)
    
  cap.release()
  return frame_paths


def normalize_image(img_path: Path) -> Path:
  """Resize to 256x256 grayscale for hashing."""
  img = cv2.imread(str(img_path))
  img = cv2.resize(img, (256, 256))
  out = TEMP_DIR / f"norm_{img_path.name}"
  cv2.imwrite(str(out), img)
  return out
