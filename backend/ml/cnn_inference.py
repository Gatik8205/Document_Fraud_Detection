import cv2
import torch
import numpy as np
import torch.nn.functional as F
from torchvision import transforms as T, models 
from PIL import Image
import os
from backend.ml.gradcam import GradCAM

DEVICE=torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
    )

MODEL_PATH=os.path.join(
    os.path.dirname(__file__), 
    'ml_model.pth'
    )

transform_pipeline=T.Compose([
    T.Resize((224, 224)),
    T.ToTensor(),
    T.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

model= models.resnet18(weights=None)
model.fc = torch.nn.Linear(model.fc.in_features, 2)

checkpoint=torch.load(
    MODEL_PATH, 
    map_location=DEVICE
    )
model.load_state_dict(
    checkpoint["model"]
    )

classes=checkpoint["classes"]

model.to(DEVICE)
model.eval()

def predict_cnn_score(image_path:str) -> int:
    img =Image.open(image_path).convert('RGB')
    img_tensor = transform_pipeline(img).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        outputs = model(img_tensor)
        probs=torch.softmax(outputs, dim=1)
        pred_class=probs.argmax(dim=1).item()
        cnn_score=int(probs[0][pred_class].item()*100)
    
    gradcam_path=generate_gradcam(img_tensor, image_path, pred_class)

    return cnn_score,gradcam_path

def generate_gradcam(image_tensor,image_path,pred_class):
    cam_generator= GradCAM(
        model=model,
        target_layer=model.layer4[-1]
    )
    
    cam=cam_generator.generate(image_tensor, pred_class)

    cam=cam-np.min(cam)
    cam=cam / np.max(cam)

    original=cv2.imread(image_path)
    original=cv2.resize(original,(224,224))

    heatmap=cv2.applyColorMap(np.uint8(255*cam),cv2.COLORMAP_JET)
    overlay=cv2.addWeighted(original,0.6,heatmap,0.4,0)

    out_dir="temp"
    os.makedirs(out_dir, exist_ok=True)

    out_path=f"{out_dir}/gradcam_{os.path.basename(image_path)}"
    cv2.imwrite(out_path, overlay)

    return out_path