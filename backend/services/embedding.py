import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
from pathlib import Path

_model = None

def get_model():
    global _model
    if _model is None:
        import torch
        import torchvision.models as models
        # Force single thread to save memory
        torch.set_num_threads(1)
        
        _model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
        _model.classifier = torch.nn.Identity()
        
        weights_path = Path(__file__).parent.parent / "sports_mobilenet_embeddings.pth"
        if weights_path.exists():
            _model.load_state_dict(
  global _model
  if _model is None:
    # Use MobileNet_V2_Weights.DEFAULT for modern torchvision
    _model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
    _model.classifier = torch.nn.Identity()
    _model.eval()
  return _model

def generate_embedding(image_path: Path) -> list[float]:
  """Generate embedding with strict memory management for Free Tiers."""
  model = get_model()
  
  transform = transforms.Compose([
    transforms.Resize((128, 128)), # Reduced from 224 to save RAM
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
  ])
  
  img = Image.open(image_path).convert("RGB")
  tensor = transform(img).unsqueeze(0)
  
  with torch.no_grad():
    vec = model(tensor).squeeze().numpy()
  
  # Crucial for 512MB RAM: Clear the tensor and trigger GC
  del tensor
  gc.collect()
  
  return vec.tolist()

def cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
  import numpy as np
  a, b = np.array(vec1), np.array(vec2)
  return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-9))
