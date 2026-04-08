from pydantic import BaseModel
from typing import Optional

class FraudBreakdown(BaseModel):
    image: int
    text: int
    meta: int
    elaHeatmap: Optional[str] = None
    edgeMap: Optional[str] = None
    cloneMap: Optional[str] = None
    gradcamMap: Optional[str] = None  # ← ADD

class FraudResult(BaseModel):
    fraudScore: int
    decision: str
    confidence: str
    flaggedPage: Optional[int] = None  # ← ADD
    totalPages: int = 1                # ← ADD
    breakdown: FraudBreakdown