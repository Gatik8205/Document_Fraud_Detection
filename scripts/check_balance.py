import os

base = "dataset"

for split in ["train", "val"]:
    real = len(os.listdir(f"{base}/{split}/real"))
    fake = len(os.listdir(f"{base}/{split}/fake"))
    print(f"{split.upper()} → REAL: {real}, FAKE: {fake}")
