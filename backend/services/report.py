from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from pathlib import Path
import datetime

def generate_evidence_report(detection: dict, out_path: Path) -> Path:
  """
  Generate a PDF evidence report for a piracy detection.
  detection: dict with keys: detection_id, verdict, confidence_score,
             matched_owner, similarity_score, gemini_description,
             timestamp_match_start, timestamp_match_end, detection_timestamp
  """
  c = canvas.Canvas(str(out_path), pagesize=A4)
  width, height = A4

  c.setFont("Helvetica-Bold", 18)
  c.drawString(50, height - 60, "Digital Asset Protection — Evidence Report")

  c.setFont("Helvetica", 11)
  c.drawString(50, height - 90, f"Detection ID: {detection['detection_id']}")
  c.drawString(50, height - 108, f"Generated: {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}")

  c.setFont("Helvetica-Bold", 13)
  c.drawString(50, height - 140, "Verdict")
  c.setFont("Helvetica", 11)
  c.drawString(50, height - 158, detection["verdict"])
  c.drawString(50, height - 174, f"Confidence Score: {round(detection['confidence_score'] * 100, 1)}%")
  c.drawString(50, height - 190, f"Similarity Score: {round(detection['similarity_score'] * 100, 1)}%")

  c.setFont("Helvetica-Bold", 13)
  c.drawString(50, height - 220, "Matched Official Asset")
  c.setFont("Helvetica", 11)
  c.drawString(50, height - 238, f"Owner: {detection.get('matched_owner', 'N/A')}")
  if detection.get("timestamp_match_start") is not None:
    ts = f"{detection['timestamp_match_start']:.1f}s – {detection['timestamp_match_end']:.1f}s"
    c.drawString(50, height - 254, f"Match Segment: {ts}")

  c.setFont("Helvetica-Bold", 13)
  c.drawString(50, height - 290, "AI Content Analysis (Gemini)")
  c.setFont("Helvetica", 10)
  desc = detection.get("gemini_description", "Not available")
  # Word-wrap description
  words, line, y = desc.split(), "", height - 308
  for word in words:
    test = f"{line} {word}".strip()
    if c.stringWidth(test, "Helvetica", 10) < width - 100:
      line = test
    else:
      c.drawString(50, y, line)
      y -= 15
      line = word
  if line:
    c.drawString(50, y, line)

  c.setFont("Helvetica-Oblique", 9)
  c.drawString(50, 40, "This report is intended for use in DMCA and platform takedown requests.")

  c.save()
  return out_path
