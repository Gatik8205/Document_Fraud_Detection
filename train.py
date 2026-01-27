import os
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from sklearn.metrics import classification_report, f1_score
from tqdm import tqdm

TRAIN_DIR = "datasets/train"
VAL_DIR = "datasets/val"
BATCH_SIZE = 32
EPOCHS = 10
LR = 1e-4
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_PATH = "ml_model.pth"


def get_loaders():
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225]),
    ])

    train_ds = datasets.ImageFolder(TRAIN_DIR, transform=transform)
    val_ds = datasets.ImageFolder(VAL_DIR, transform=transform)

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=2)

    print("Train Classes:", train_ds.classes)
    print("Train Samples:", len(train_ds))
    print("Val Samples:", len(val_ds))

    return train_loader, val_loader, train_ds.classes


def train_model():
    train_loader, val_loader, classes = get_loaders()

    model = models.resnet18(weights="IMAGENET1K_V1")
    model.fc = nn.Linear(model.fc.in_features, 2)
    model.to(DEVICE)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=LR)

    for epoch in range(EPOCHS):
        model.train()
        running_loss = 0

        for imgs, labels in tqdm(train_loader, desc=f"Epoch {epoch+1}/{EPOCHS}"):
            imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)

            optimizer.zero_grad()
            outputs = model(imgs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item()

        avg_loss = running_loss / len(train_loader)
        print(f"Epoch {epoch+1} Loss: {avg_loss:.4f}")

        validate(model, val_loader)

    torch.save({"model": model.state_dict(), "classes": classes}, MODEL_PATH)
    print("Model saved to:", MODEL_PATH)


def validate(model, val_loader):
    model.eval()
    preds, trues = [], []

    with torch.no_grad():
        for imgs, labels in val_loader:
            imgs = imgs.to(DEVICE)
            outputs = model(imgs)
            _, predicted = torch.max(outputs.data, 1)

            preds.extend(predicted.cpu().tolist())
            trues.extend(labels.tolist())

    print("Validation F1:", f1_score(trues, preds, average="weighted"))
    print(classification_report(trues, preds, target_names=["fake", "real"]))


if __name__ == "__main__":
    train_model()
