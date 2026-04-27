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


def extract_frames(video_path: Path, fps: int = 1) -> list[Path]:
  """Extract 1 frame per second from a video. Returns list of image paths."""
  cap = cv2.VideoCapture(str(video_path))
  video_fps = cap.get(cv2.CAP_PROP_FPS) or 25
  frames, frame_paths = [], []
  idx = 0
  while True:
    ret, frame = cap.read()
    if not ret:
      break
    if idx % int(video_fps / fps) == 0:
      p = TEMP_DIR / f"{video_path.stem}_f{idx}.jpg"
      cv2.imwrite(str(p), frame)
      frame_paths.append(p)
    idx += 1
  cap.release()
  return frame_paths


def normalize_image(img_path: Path) -> Path:
  """Resize to 256x256 grayscale for hashing."""
  img = cv2.imread(str(img_path))
  img = cv2.resize(img, (256, 256))
  out = TEMP_DIR / f"norm_{img_path.name}"
  cv2.imwrite(str(out), img)
  return out
