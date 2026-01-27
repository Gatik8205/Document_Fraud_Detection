from .preprocess import preprocess_image
from .model import predict_image_forgery

def analyze_image(image_path):
    img_tensor= preprocess_image(image_path)
    score = predict_image_forgery(img_tensor)
    return score