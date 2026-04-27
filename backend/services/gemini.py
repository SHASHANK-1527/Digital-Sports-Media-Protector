import google.generativeai as genai
import os
from pathlib import Path

genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
model = genai.GenerativeModel("gemini-1.5-flash")

def describe_content(image_path: Path) -> str:
  """
  Send an image frame to Gemini and get a natural-language description
  of the sports content it shows (for use in the evidence report).
  """
  with open(image_path, "rb") as f:
    image_data = f.read()

  prompt = (
    "You are analyzing a frame from a sports media clip. "
    "Describe what you see in detail: identify any visible team logos, "
    "jersey colors, stadium elements, match graphics, or sport type. "
    "This description will be used in an intellectual property evidence report. "
    "Be factual and specific. Keep response under 100 words."
  )

  response = model.generate_content([
    {"mime_type": "image/jpeg", "data": image_data},
    prompt
  ])
  return response.text.strip()
