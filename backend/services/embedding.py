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
                torch.load(weights_path, map_location="cpu")
            )
            print("Loaded fine-tuned sports model (88% accuracy)")
        else:
            print("Fine-tuned weights not found, using pretrained ImageNet weights")
        
        _model.eval()
    return _model


transform = None
def get_transform():
    global transform
    if transform is None:
        import torchvision.transforms as tf
        transform = tf.Compose([
            tf.Resize((224, 224)),
            tf.ToTensor(),
            tf.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
    return transform


def generate_embedding(image_path: Path) -> list[float]:
    """Generate 1280-dim MobileNetV2 feature vector for an image."""
    import torch
    model = get_model()
    transform = get_transform()
    
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
