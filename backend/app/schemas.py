from pydantic import BaseModel
from typing import Optional

class FraudBreakdown(BaseModel):
    image: int
    text: int
    meta: int
    elaHeatmap: Optional[str] = None
    edgeMap: Optional[str] = None
    cloneMap: Optional[str] = None


class FraudResult(BaseModel):
    fraudScore: int
    decision: str
    confidence: str
    breakdown: FraudBreakdown
