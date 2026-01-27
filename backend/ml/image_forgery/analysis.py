from PIL import Image, ImageChops, ImageEnhance
from pathlib import Path
import numpy as np
import cv2
import os

def apply_ela(file_path, quality=90, save_path=None):
    """Return ELA anomaly score + save heatmap (optional)"""
    
    file_path = str(file_path)
    temp_path = f"{file_path}_tmp.jpg"

    img = Image.open(file_path).convert("RGB")
    img.save(temp_path, 'JPEG', quality=quality)

    recompressed = Image.open(temp_path)
    ela_img = ImageChops.difference(img, recompressed)
    ela_img = ImageEnhance.Brightness(ela_img).enhance(30)

    ela_array = np.asarray(ela_img)
    raw_score = np.mean(ela_array)

    score = min(100, max(0, raw_score / 2.55))  # normalize 0-100

    if save_path:
        ela_img.save(save_path)

    os.remove(temp_path)
    return int(score)

def compute_noise_score(file_path):
    file_path = str(file_path)
    img = cv2.imread(file_path, cv2.IMREAD_GRAYSCALE)
    if img is None: return 50

    lap_var = cv2.Laplacian(img, cv2.CV_64F).var()

    if lap_var < 50: sharp = 80
    elif lap_var > 1500: sharp = 70
    else: sharp = 30

    block_size = 32
    h, w = img.shape
    block_vars = [img[y:y+block_size, x:x+block_size].var()
                  for y in range(0, h, block_size)
                  for x in range(0, w, block_size)]

    var_spread = np.std(block_vars) if len(block_vars) > 1 else 0

    if var_spread > 500: block = 85
    elif var_spread > 200: block = 65
    else: block = 30

    return int((sharp + block) / 2)

def compute_color_edge_score(file_path):
    file_path = str(file_path)
    img = cv2.imread(file_path)
    if img is None: return 50

    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    s_var = np.var(s)

    if s_var < 50: color = 60
    elif s_var < 2000: color = 75
    else: color = 30

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    edge_density = np.mean(edges)

    if edge_density > 40: edge = 75
    elif edge_density < 5: edge = 65
    else: edge = 30

    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    L, A, B = cv2.split(lab)
    lab_disp = np.mean([np.var(L), np.var(A), np.var(B)])

    lab_score = 70 if lab_disp > 3000 else 30

    return int((color + edge + lab_score) / 3)

def compute_clone_score(file_path):
    file_path = str(file_path)
    img = cv2.imread(file_path, cv2.IMREAD_GRAYSCALE)
    if img is None: return 50

    orb = cv2.ORB_create(nfeatures=2000)
    kp, des = orb.detectAndCompute(img, None)
    if des is None or len(kp) < 50: return 40

    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    matches = bf.match(des, des)
    dists = [m.distance for m in matches if m.distance != 0]

    if not dists: return 30

    avg = np.mean(dists)

    if avg < 20: score = 85
    elif avg < 40: score = 65
    elif avg < 80: score = 40
    else: score = 20

    return score

def generate_edge_map(file_path, save_path):
    file_path = str(file_path)
    img = cv2.imread(file_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    cv2.imwrite(save_path, edges)

def generate_clone_visual(file_path, save_path):
    file_path = str(file_path)
    img = cv2.imread(file_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    orb = cv2.ORB_create(nfeatures=2000)
    kp, des = orb.detectAndCompute(gray, None)

    if des is None or len(kp) < 50:
        cv2.imwrite(save_path, img)
        return

    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    matches = bf.match(des, des)
    matches = sorted(matches, key=lambda x: x.distance)[:50]

    match_img = cv2.drawMatches(img, kp, img, kp, matches, None)
    cv2.imwrite(save_path, match_img)

def analyze_image(file_path):
    file_path = str(file_path)
    base = os.path.splitext(os.path.basename(file_path))[0]

    out_dir = "temp"
    os.makedirs(out_dir, exist_ok=True)

    ela_path = f"{out_dir}/{base}_ela.jpg"
    edge_path = f"{out_dir}/{base}_edges.jpg"
    clone_path = f"{out_dir}/{base}_clone.jpg"

    ela = apply_ela(file_path, save_path=ela_path)
    noise = compute_noise_score(file_path)
    color_edge = compute_color_edge_score(file_path)
    clone = compute_clone_score(file_path)

    generate_edge_map(file_path, edge_path)
    generate_clone_visual(file_path, clone_path)

    final = int((ela + noise + color_edge + clone) / 4)

    return final, ela_path, edge_path, clone_path