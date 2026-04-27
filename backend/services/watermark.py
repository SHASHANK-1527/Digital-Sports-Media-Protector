from imwatermark import WatermarkEncoder, WatermarkDecoder
import cv2
import numpy as np
from pathlib import Path


def embed_watermark(image_path: Path, payload: str, out_path: Path) -> Path:
  """
  Embed invisible DCT-based watermark into an image.
  payload: string like "content_id:owner:timestamp"
  """
  bgr = cv2.imread(str(image_path))
  encoder = WatermarkEncoder()
  encoder.set_watermark('bytes', payload.encode('utf-8')[:32])  # max 32 bytes
  encoded = encoder.encode(bgr, 'dwtDct')
  cv2.imwrite(str(out_path), encoded)
  return out_path


def extract_watermark(image_path: Path) -> str | None:
  """Attempt to extract watermark payload from an image."""
  try:
    bgr = cv2.imread(str(image_path))
    decoder = WatermarkDecoder('bytes', 32 * 8)
    payload = decoder.decode(bgr, 'dwtDct')
    return payload.decode('utf-8').strip('\x00')
  except Exception:
    return None
