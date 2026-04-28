import os
from pathlib import Path

_gemini_model = None

def get_gemini_model():
    global _gemini_model
    if _gemini_model is None:
        import google.generativeai as genai
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            return None
        genai.configure(api_key=api_key)
        _gemini_model = genai.GenerativeModel("gemini-1.5-flash")
    return _gemini_model

def describe_content(image_path: Path) -> str:
    """
    Send an image frame to Gemini and get a natural-language description
    of the sports content it shows (for use in the evidence report).
    """
    model = get_gemini_model()
    if not model:
        return "Gemini API key not configured."
    
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
