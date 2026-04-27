import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
from pathlib import Path

model = models.mobilenet_v2(pretrained=True)
model.classifier = torch.nn.Identity()   # remove classification head, keep embeddings
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])


def generate_embedding(image_path: Path) -> list[float]:
    """Generate 1280-dim MobileNetV2 feature vector for an image."""
    img = Image.open(image_path).convert("RGB")
    tensor = transform(img).unsqueeze(0)
    with torch.no_grad():
        vec = model(tensor).squeeze().numpy()
    return vec.tolist()


def cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
    """Cosine similarity between two embedding vectors. Returns 0.0–1.0."""
    import numpy as np
    a, b = np.array(vec1), np.array(vec2)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-9))
